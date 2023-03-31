import React, { ReactElement } from "react"



interface ButtonProps {
    text: string
    icon?: ReactElement<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string, titleId?: string } & React.RefAttributes<SVGSVGElement>>
    onClick?: () => void
    className?: string
    disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({ text, icon, onClick, className, disabled }) => {
    return (<button className={`bg-purple-500 px-5 py-2 rounded-lg flex items-center justify-center text-base-white text-sm ${disabled ? `!bg-gray-600 !text-gray-500 cursor-not-allowed` : ''} ${className}`} onClick={disabled ? () => { } : onClick}>
        {icon && <div className="mr-2 h-5 w-5">{icon}</div>}
        <h1>{text}</h1>
    </button>)
}