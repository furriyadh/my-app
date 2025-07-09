// Global type definitions

declare module 'shimmer' {
  export function shimmer(element: HTMLElement): void;
  export function shimmer(selector: string): void;
  export default shimmer;
}

declare module 'tedious' {
  export class Connection {
    constructor(config: any);
    connect(callback?: (err?: Error) => void): void;
    close(): void;
  }
  
  export class Request {
    constructor(sql: string, callback?: (err?: Error) => void);
    addParameter(name: string, type: any, value: any): void;
  }
  
  export const TYPES: {
    VarChar: any;
    Int: any;
    DateTime: any;
    Bit: any;
    NVarChar: any;
  };
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.ico' {
  const content: string;
  export default content;
}

declare module '*.bmp' {
  const content: string;
  export default content;
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
    GOOGLE_DEVELOPER_TOKEN: string;
    GOOGLE_ADS_REFRESH_TOKEN: string;
    MCC_LOGIN_CUSTOMER_ID: string;
    JWT_SECRET: string;
    NEXTAUTH_SECRET: string;
    ENCRYPTION_KEY: string;
    DATABASE_URL: string;
    EMAIL_SENDER_EMAIL: string;
    EMAIL_SENDER_PASSWORD: string;
    GOOGLE_MAPS_API_KEY: string;
    GOOGLE_AI_API_KEY: string;
    GOOGLE_GEMINI_API_KEY: string;
  }
}

// Global types
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    google?: any;
    gapi?: any;
  }
}

export {};

