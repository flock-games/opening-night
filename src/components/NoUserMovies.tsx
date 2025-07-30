import { SyncYoutubeLikesButton } from "./SyncYoutubeLikesButton";

export function NoUserMovies() {
  return (
    <div className="my-4 mx-4 lg:mx-auto max-2-2xl">
      <div className="mb-4 mx-4 lg:mx-auto lg:max-w-4xl text-center">
        <h2 className="text-2xl mt-16 mb-8 font-black">No movies yet...</h2>
        <SyncYoutubeLikesButton />
        <p className=" mb-2">Try syncing your YouTube likes.</p>
        <p className="text-slate-400 text-sm">
          Opening Night is still in beta. If it fails to identify movies that
          should be here, please let us know!
        </p>
      </div>
    </div>
  );
}
