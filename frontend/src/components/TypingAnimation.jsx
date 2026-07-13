export default function TypingAnimation() {
  return (
    <div className="flex items-center gap-2 rounded-2xl rounded-bl-none bg-dark-card px-4 py-3">
      <span className="text-sm font-medium text-gray-400">CosmoGPT</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce-dot rounded-full bg-gray-400 [animation-delay:-0.32s]" />
        <span className="h-2 w-2 animate-bounce-dot rounded-full bg-gray-400 [animation-delay:-0.16s]" />
        <span className="h-2 w-2 animate-bounce-dot rounded-full bg-gray-400" />
      </div>
    </div>
  )
}
