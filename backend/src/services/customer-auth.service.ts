import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CustomerModel from '@/models/customer.model';
import TenantModel from '@/models/tenant.model';
import { HttpException } from '@/exceptions/HttpException';
import { JWT_SECRET } from '@/config';

const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

export interface CustomerRegisterBody {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

export interface CustomerLoginBody {
  email: string;
  password: string;
}

/**
 * Customer auth for the user-facing app.
 * JWT payload includes userType: 'customer' so it is never confused with admin tokens.
 */
class CustomerAuthService {
  public customers = CustomerModel;
  public tenants = TenantModel;

  private generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET!, {
      algorithm: 'HS256',
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Resolve tenantId from store subdomain.
   */
  public async getTenantIdBySubdomain(subdomain: string): Promise<string> {
    const normalized = subdomain.toLowerCase().trim();
    const tenant = await this.tenants.findOne({ subdomain: normalized }).select('_id');
    if (!tenant) {
      throw new HttpException(404, 'Store not found');
    }
    return tenant._id.toString();
  }

  /**
   * Register a customer for a store (tenant).
   */
  public async register(subdomain: string, body: CustomerRegisterBody) {
    const { email, name, password, phone } = body;

    if (!email || !name || !password) {
      throw new HttpException(400, 'Email, name and password are required');
    }
    if (password.length < 6) {
      throw new HttpException(400, 'Password must be at least 6 characters');
    }

    const tenantId = await this.getTenantIdBySubdomain(subdomain);
    const emailLower = email.toLowerCase().trim();

    const existing = await this.customers.findOne({ tenantId, email: emailLower });
    if (existing) {
      throw new HttpException(400, 'An account with this email already exists for this store');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const customer = await this.customers.create({
      tenantId,
      email: emailLower,
      name: name.trim(),
      password: hashedPassword,
      phone: phone?.trim() || undefined,
      isActive: true,
    });

    const token = this.generateToken({
      userType: 'customer',
      customerId: customer._id.toString(),
      tenantId: customer.tenantId.toString(),
      email: customer.email,
      name: customer.name,
    });

    return {
      token,
      customer: {
        id: customer._id.toString(),
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        tenantId: customer.tenantId.toString(),
      },
    };
  }

  /**
   * Login a customer for a store (tenant).
   */
  public async login(subdomain: string, body: CustomerLoginBody) {
    const { email, password } = body;

    if (!email || !password) {
      throw new HttpException(400, 'Email and password are required');
    }

    const tenantId = await this.getTenantIdBySubdomain(subdomain);
    const emailLower = email.toLowerCase().trim();

    const customer = await this.customers.findOne({ tenantId, email: emailLower });
    if (!customer) {
      throw new HttpException(401, 'Invalid email or password');
    }
    if (!customer.isActive) {
      throw new HttpException(403, 'Account is deactivated');
    }

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      throw new HttpException(401, 'Invalid email or password');
    }

    const token = this.generateToken({
      userType: 'customer',
      customerId: customer._id.toString(),
      tenantId: customer.tenantId.toString(),
      email: customer.email,
      name: customer.name,
    });

    return {
      token,
      customer: {
        id: customer._id.toString(),
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        tenantId: customer.tenantId.toString(),
      },
    };
  }

  /**
   * Verify customer JWT and return payload if valid and userType is 'customer'.
   */
  public verifyCustomerToken(token: string): { isValid: boolean; payload?: any; error?: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as any;
      if (decoded?.userType !== 'customer') {
        return { isValid: false, error: 'Invalid token type' };
      }
      return { isValid: true, payload: decoded };
    } catch (error: any) {
      return { isValid: false, error: error.message };
    }
  }
}

export default CustomerAuthService;
