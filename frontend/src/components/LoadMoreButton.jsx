export default function LoadMoreButton(props) {
  return (
    <div class="mt-3">
      {props.hasMore && (
        <button onClick={props.onClick} class="btn-primary w-full flex items-center justify-center gap-2">
          {!props.isLoading ? props.label || 'Load More' : 'Loading...'}
        </button>
      )}
    </div>
  )
}
