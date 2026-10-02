
const SignUpBtn = ({ className = '' }) => {
    return (
        <div className="inline-block group">
            <button className={`relative px-6 py-2 text-foreground bg-background overflow-hidden cursor-pointer rounded-none ${className}`}>
                <span className="relative z-10">Sign up</span>

                {/* Top */}
                <span className="absolute top-0 left-0 h-0.5 w-0 bg-black dark:bg-white 
      transition-all duration-300 
      group-hover:w-full"></span>

                {/* Right */}
                <span className="absolute top-0 right-0 w-0.5 h-0 bg-black dark:bg-white 
      transition-all duration-300 delay-300
      group-hover:h-full"></span>

                {/* Bottom */}
                <span className="absolute bottom-0 right-0 h-0.5 w-0 bg-black dark:bg-white 
      transition-all duration-300 delay-600
      group-hover:w-full"></span>

                {/* Left */}
                <span className="absolute bottom-0 left-0 w-0.5 h-0 bg-black dark:bg-white 
      transition-all duration-300 delay-900
      group-hover:h-full"></span>
            </button>
        </div>
    )
}

export default SignUpBtn