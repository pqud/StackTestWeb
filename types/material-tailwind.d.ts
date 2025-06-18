declare module "@material-tailwind/react" {
    export interface CardProps {
      children?: React.ReactNode;
      className?: string;
      placeholder?: string;
      onPointerEnterCapture?: () => void;
      onPointerLeaveCapture?: () => void;
      [key: string]: any;
    }
    
    export const Card: React.FC<CardProps>;
    export const CardHeader: React.FC<CardProps>;
    export const CardBody: React.FC<CardProps>;
    export const CardFooter: React.FC<CardProps>;
    export const Typography: React.FC<CardProps>;
    export const Button: React.FC<CardProps>;
    // 다른 컴포넌트들도 필요시 추가
  }
  