export const HomepageCard = ({ number, description }: { number: string | undefined, description: string | undefined }) =>
    <div className="bg-gray-600/20 w-full h-32 rounded-lg flex flex-col justify-center px-8">
        <h1 className="text-white text-3xl font-bold">{number || 0}</h1>
        <h1 className="text-purple-50/80">{description || "hmm?"}</h1>
    </div>