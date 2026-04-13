import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'

type FormCardProps = Omit<React.ComponentProps<typeof Card>, 'title'> & {
  title?: React.ReactNode
  description?: React.ReactNode
}

function FormCard({
  children,
  className,
  title,
  description,
  ...props
}: FormCardProps) {
  return (
    <Card {...props} className={cn('mx-auto w-full max-w-lg', className)}>
      {!!(title ?? description) && (
        <CardHeader>
          {!!title && <CardTitle>{title}</CardTitle>}
          {!!description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent>{children}</CardContent>
    </Card>
  )
}

type FormCardSkeletonProps = Omit<
  React.ComponentProps<typeof Card>,
  'title'
> & {
  title?: boolean
  description?: boolean
}

function FormCardSkeleton({
  children,
  className,
  title = true,
  description = true,
  ...props
}: FormCardSkeletonProps) {
  return (
    <Card {...props} className={cn('mx-auto w-full max-w-lg', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <Skeleton className="h-5 w-3/12!" />}
          {description && (
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-9/12!" />
              <Skeleton className="h-3.5 w-7/12!" />
            </div>
          )}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export { FormCard, FormCardSkeleton }
