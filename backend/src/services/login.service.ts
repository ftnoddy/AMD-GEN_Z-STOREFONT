import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import InventoryUserModel from '@/models/inventory-user.model';
import { IRegisterRequest, ILoginRequest } from '@/interfaces/login.interface';
import { JWT_SECRET } from '@/config';

const JWT_EXPIRES_IN = '24h';

class LoginService {
  /**
   * Generate JWT token
   */
  private generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET!, {
      algorithm: 'HS256',
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify JWT token
   */
  public verifyToken(token: string): { isValid: boolean; payload?: any; error?: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET!);
      return { isValid: true, payload: decoded };
    } catch (error: any) {
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Register a new user
   */
  public async register(data: any): Promise<{ status: number; message: string; user?: any; token?: string }> {
    const { name, email, password, role = 'Staff', tenantId } = data;

    // Validation
    if (!email || !password || !name) {
      return { status: 400, message: 'Name, email and password are required' };
    }

    if (password.length < 6) {
      return { status: 400, message: 'Password must be at least 6 characters long' };
    }

    if (!tenantId) {
      return { status: 400, message: 'Tenant ID is required. Please contact your administrator.' };
    }

    // Check if user already exists for this tenant
    const existingUser = await InventoryUserModel.findOne({ 
      tenantId, 
      email: email.toLowerCase() 
    });
    if (existingUser) {
      return { status: 400, message: 'User with this email already exists for this tenant' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await InventoryUserModel.create({
      tenantId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'Staff',
      isActive: true,
    });

    // Generate token
    const tokenPayload = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId.toString(),
    };

    const token = this.generateToken(tokenPayload);

    return {
      status: 201,
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  /**
   * Login user
   */
  public async login(data: ILoginRequest): Promise<{ status: number; token?: string; message?: string; user?: any }> {
    const { email, password } = data;

    // Validation
    if (!email || !password) {
      return { status: 400, message: 'Email and password are required' };
    }

    // Find user
    const user = await InventoryUserModel.findOne({ email: email.toLowerCase() }).populate('tenantId');
    if (!user) {
      return { status: 401, message: 'Invalid email or password' };
    }

    // Check if user is active
    if (!user.isActive) {
      return { status: 403, message: 'Account is deactivated. Please contact your administrator.' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { status: 401, message: 'Invalid email or password' };
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const tokenPayload = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId.toString(),
    };

    const token = this.generateToken(tokenPayload);

    return {
      status: 200,
      token,
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        avatar: user.avatar,
        phone: user.phone,
      },
    };
  }

  /**
   * Logout (stateless JWT - nothing to do server-side)
   */
  public async logout(): Promise<{ status: number; message: string }> {
    return { status: 200, message: 'Logged out successfully' };
  }
}

export default LoginService;

