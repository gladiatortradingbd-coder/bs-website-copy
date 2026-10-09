import Link from "next/link";

const NotFound = () => {
  return (
    <main className="section pd-120px full-height w-full max-w-7xl mx-auto m-10 p-10">
      <div className="container-default width-100">
        <div className="inner-container _1114px center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <article className="content-center-tablet">
              <p className="_404-number text-[120px] md:text-[160px] font-bold leading-none text-green-700" aria-label="Error code 404">
                404
              </p>

              <h1 className="display-7 mid text-4xl md:text-5xl font-bold mt-4">
                Oops! page not found.
              </h1>

              <div className="mg-top-small mt-5">
                <div className="inner-container _400px _100-tablet">
                  <p className="paragraph-large text-muted-foreground leading-8">
                    The page you are looking for may have moved. Return home to
                    continue exploring our saree collection.
                  </p>
                </div>
              </div>

              <div className="mg-top-default mt-8">
                <nav className="buttons-row left" aria-label="Not found actions">
                  <Link
                    href="/"
                    className="primary-button inline-flex items-center justify-center px-6 py-4 rounded-xl bg-green-700 text-white dark:text-black font-medium hover:bg-green-800 transition-all duration-300"
                  >
                    Go back home
                  </Link>
                </nav>
              </div>
            </article>

            {/* Right Image */}
            <div className="inner-container _592px _100-tablet">
              <figure className="image-wrapper border-radius-16px overflow-hidden rounded-2xl">
                <img
                  src="https://cdn.prod.website-files.com/677c0cb8cb8c7ef4098f243d/677c0cb8cb8c7ef4098f272d_planted-plant-in-white-pot-store-x-webflow-template.jpg"
                  alt="404 Illustration"
                  className="_w-h-100 fit-cover w-full h-full object-cover"
                />
              </figure>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};

export default NotFound;