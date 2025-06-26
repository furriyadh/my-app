import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500">
        <X className="h-4 w-4" />
        <span className="sr-only">إغلاق</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-gray-600", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Confirmation Dialog Component
const ConfirmationDialog = React.forwardRef(({
  open,
  onOpenChange,
  title = "تأكيد العملية",
  description = "هل أنت متأكد من أنك تريد المتابعة؟",
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  onConfirm,
  onCancel,
  variant = "default", // default, destructive, warning
  icon,
  className,
  ...props
}, ref) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          confirmClass: "bg-red-600 hover:bg-red-700 text-white",
          iconBg: "bg-red-100"
        }
      case "warning":
        return {
          icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
          confirmClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
          iconBg: "bg-yellow-100"
        }
      default:
        return {
          icon: <Info className="h-6 w-6 text-blue-600" />,
          confirmClass: "bg-blue-600 hover:bg-blue-700 text-white",
          iconBg: "bg-blue-100"
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent ref={ref} className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-full", variantStyles.iconBg)}>
              {icon || variantStyles.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-right">{title}</DialogTitle>
              <DialogDescription className="text-right mt-2">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors",
              variantStyles.confirmClass
            )}
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
ConfirmationDialog.displayName = "ConfirmationDialog"

// Success Dialog Component
const SuccessDialog = React.forwardRef(({
  open,
  onOpenChange,
  title = "تم بنجاح!",
  description = "تمت العملية بنجاح.",
  buttonText = "موافق",
  onClose,
  className,
  ...props
}, ref) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent ref={ref} className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl text-green-800">{title}</DialogTitle>
              <DialogDescription className="mt-2 text-green-600">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            {buttonText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
SuccessDialog.displayName = "SuccessDialog"

// Campaign Preview Dialog
const CampaignPreviewDialog = React.forwardRef(({
  open,
  onOpenChange,
  campaign,
  onEdit,
  onLaunch,
  className,
  ...props
}, ref) => {
  if (!campaign) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent ref={ref} className={cn("sm:max-w-2xl max-h-[80vh] overflow-y-auto", className)}>
        <DialogHeader>
          <DialogTitle className="text-xl">معاينة الحملة الإعلانية</DialogTitle>
          <DialogDescription>
            راجع تفاصيل حملتك قبل الإطلاق
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Basic Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">المعلومات الأساسية</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">اسم الحملة:</span>
                <p className="font-medium">{campaign.name}</p>
              </div>
              <div>
                <span className="text-gray-600">نوع الحملة:</span>
                <p className="font-medium">{campaign.type}</p>
              </div>
              <div>
                <span className="text-gray-600">الميزانية اليومية:</span>
                <p className="font-medium text-green-600">${campaign.budget}</p>
              </div>
              <div>
                <span className="text-gray-600">الموقع الجغرافي:</span>
                <p className="font-medium">{campaign.location}</p>
              </div>
            </div>
          </div>

          {/* Ad Previews */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">معاينة الإعلانات</h3>
            <div className="space-y-3">
              {campaign.ads?.map((ad, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-600 hover:underline cursor-pointer">
                        {ad.headline}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                      <p className="text-xs text-green-600 mt-1">{ad.url}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          {campaign.keywords && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">الكلمات المفتاحية</h3>
              <div className="flex flex-wrap gap-2">
                {campaign.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Performance Predictions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">التوقعات الأولية</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(campaign.budget * 2.5)}
                </p>
                <p className="text-xs text-gray-600">نقرة متوقعة</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(campaign.budget * 125)}
                </p>
                <p className="text-xs text-gray-600">ظهور متوقع</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(campaign.budget * 0.15)}
                </p>
                <p className="text-xs text-gray-600">تحويل متوقع</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            تعديل
          </button>
          <button
            onClick={onLaunch}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            إطلاق الحملة
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
CampaignPreviewDialog.displayName = "CampaignPreviewDialog"

// File Upload Dialog
const FileUploadDialog = React.forwardRef(({
  open,
  onOpenChange,
  title = "رفع الملفات",
  description = "اختر الملفات المطلوبة للحملة",
  acceptedTypes = "image/*,video/*",
  maxFiles = 5,
  onFilesSelected,
  className,
  ...props
}, ref) => {
  const [dragActive, setDragActive] = React.useState(false)
  const [files, setFiles] = React.useState([])
  const fileInputRef = React.useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files).slice(0, maxFiles)
    setFiles(droppedFiles)
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, maxFiles)
    setFiles(selectedFiles)
  }

  const handleUpload = () => {
    onFilesSelected?.(files)
    setFiles([])
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent ref={ref} className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes}
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="space-y-2">
              <div className="text-gray-600">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-sm">
                <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                  انقر لاختيار الملفات
                </span>
                <span className="text-gray-500"> أو اسحب الملفات هنا</span>
              </div>
              <p className="text-xs text-gray-500">
                الحد الأقصى {maxFiles} ملفات
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">الملفات المحددة:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <button
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange?.(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            رفع الملفات
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
FileUploadDialog.displayName = "FileUploadDialog"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  ConfirmationDialog,
  SuccessDialog,
  CampaignPreviewDialog,
  FileUploadDialog,
}

