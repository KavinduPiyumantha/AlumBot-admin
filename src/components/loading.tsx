import LoadingSvg from "./loadingSvg";

export const CenterLoading = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="flex flex-col items-center">
      <LoadingSvg className="fill-slate-500" />
      <span className="text-sm text-zinc-500 mt-1">loading...</span>
    </div>
  </div>
);

// Add a simple loading spinner to use as default export
const Loading = () => (
  <div className="inline-flex items-center">
    <LoadingSvg className="w-4 h-4 fill-current" />
    <span className="ml-2">Loading...</span>
  </div>
);

export default Loading;
