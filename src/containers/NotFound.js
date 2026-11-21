import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="w-full bg-[#FBF6F3] py-12 sm:py-16">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-6 text-center">
        <h1 className="font-serif text-7xl font-bold leading-none text-[#7A1230] sm:text-8xl">
          404
        </h1>

        <p className="mt-3 text-base text-[#1B1113] sm:text-lg">
          This page moved or doesn’t exist.
        </p>

        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#7A1230] px-8 text-sm font-bold text-white no-underline transition duration-200 hover:bg-[#5E0E25] hover:no-underline"
          >
            Go to Dashboard
          </Link>

          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#C8962A] px-8 text-sm font-bold text-[#1B1113] no-underline transition duration-200 hover:bg-[#B9770E] hover:text-white hover:no-underline"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;