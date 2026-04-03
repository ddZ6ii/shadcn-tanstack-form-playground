import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'

interface WithTooltipProps extends React.ComponentProps<typeof Tooltip> {
  content: React.ReactNode
  side?: React.ComponentProps<typeof TooltipContent>['side']
}

function WithTooltip({
  content,
  side = 'top',
  children,
  ...props
}: WithTooltipProps) {
  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild>
        <span className="inline-block w-fit">{children}</span>
      </TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </Tooltip>
  )
}

export default WithTooltip
