import React, { ReactElement } from "react"



interface ButtonProps {
    text: string
    icon?: ReactElement<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string, titleId?: string } & React.RefAttributes<SVGSVGElement>>
    onClick?: () => void
    className?: string
}

export const Button: React.FC<ButtonProps> = ({ text, icon, onClick, className }) => {
    return (<button className={`bg-purple-500 px-6 py-2 rounded-lg flex items-center justify-center text-purple-50 ${className}`} onClick={onClick}>
        {icon && <div className="mr-2 h-5 w-5">{icon}</div>}
        <h1 className="text-purple-50/90">{text}</h1>
    </button>)
}