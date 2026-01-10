interface BranchifyLogoProps {
    width?: number;
    height?: number;
    color?: string;
}

export function BranchifyLogo({ color = '#000', width = 60, height = 100 }: BranchifyLogoProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <mask id="branchify-logo" x="0" y="0" width="300" height="500">
                    <rect width="300" height="500" fill="black" />
                    <circle cx="150" cy="150" r="150" fill="white" />
                    <circle cx="150" cy="150" r="50" fill="black" />
                    <circle cx="150" cy="350" r="150" fill="white" />
                    <circle cx="150" cy="350" r="50" fill="black" />
                    <rect x="0" y="150" width="100" height="345" fill="white" />
                    <rect x="5" y="450" width="145" height="100" fill="white" />
                    <circle cx="5" cy="495" r="5" fill="white" />
                </mask>
            </defs>
            <rect width="300" height="500" fill={color} mask="url(#branchify-logo)" />
        </svg>
    );
}
