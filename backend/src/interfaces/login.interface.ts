export interface IUser {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currentJobTitle: string;
    yearsOfExperience: number;
  }

  export interface IRegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    currentJobTitle: string;
    yearsOfExperience: number;
    password: string;
    confirmPassword: string;
  }
  
  export interface ILoginRequest {
    email: string;
    password: string;
  }
  