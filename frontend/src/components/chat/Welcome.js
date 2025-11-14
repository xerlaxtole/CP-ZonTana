export default function Welcome() {
  return (
    <div className="lg:col-span-2 lg:block bg-white dark:bg-gray-900">
      <div className="pl-5">
        <div className="relative w-full max-w-xl mx-auto">
          <img
            src="/welcome.png"
            alt="Welcome"
            className="w-full mt-20 opacity-90 mask-gradient"
            style={{
              maskImage: 'radial-gradient(ellipse at center, black 45%, transparent 69%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)'
            }}
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-400 dark:text-gray-400">
            Welcome to ZonTana! Select a chat to get started.
          </h2>
        </div>
      </div>
    </div>
  );
}
