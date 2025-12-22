import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react"
import { cn } from "../../lib/utils"

// Type definitions
interface DialogOverlayProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {
  className?: string;
}
interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  className?: string;
  children?: React.ReactNode;
}
interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
interface DialogTitleProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  className?: string;
}
interface DialogDescriptionProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> {
  className?: string;
}

interface ConfirmationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive" | "warning";
  icon?: React.ReactNode;
  className?: string;
}

interface SuccessDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  buttonText?: string;
  onClose?: () => void;
  className?: string;
}

interface CampaignPreviewDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  campaign?: {
    name: string;
    type: string;
    budget: number;
    location: string;
    ads?: Array<{
      headline: string;
      description: string;
      url: string;
    }>;
    keywords?: string[];
  };
  onEdit?: () => void;
  onLaunch?: () => void;
  className?: string;
}

interface FileUploadDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  acceptedTypes?: string;
  maxFiles?: number;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
}

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, ...props }, ref) => 
  React.createElement(DialogPrimitive.Overlay, {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  })
)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, ...props }, ref) => 
  React.createElement(
    DialogPortal,
    null,
    React.createElement(DialogOverlay),
    React.createElement(
      DialogPrimitive.Content,
      {
        ref,
        className: cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        ),
        ...props
      },
      children,
      React.createElement(
        DialogPrimitive.Close,
        {
          className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500"
        },
        React.createElement(X, { className: "h-4 w-4" }),
        React.createElement("span", { className: "sr-only" }, "إغلاق")
      )
    )
  )
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader: React.FC<DialogHeaderProps> = ({ className, ...props }) => 
  React.createElement("div", {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  })
DialogHeader.displayName = "DialogHeader"

const DialogFooter: React.FC<DialogFooterProps> = ({ className, ...props }) => 
  React.createElement("div", {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  })
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, ...props }, ref) => 
  React.createElement(DialogPrimitive.Title, {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight text-gray-900",
      className
    ),
    ...props
  })
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, ...props }, ref) => 
  React.createElement(DialogPrimitive.Description, {
    ref,
    className: cn("text-sm text-gray-600", className),
    ...props
  })
)
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Confirmation Dialog Component
const ConfirmationDialog = React.forwardRef<HTMLDivElement, ConfirmationDialogProps>(({
  open,
  onOpenChange,
  title = "تأكيد العملية",
  description = "هل أنت متأكد من أنك تريد المتابعة؟",
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  onConfirm,
  onCancel,
  variant = "default",
  icon,
  className,
  ...props
}, ref) => {
  const getVariantStyles = React.useCallback(() => {
    switch (variant) {
      case "destructive":
        return {
          icon: React.createElement(AlertTriangle, { className: "h-6 w-6 text-red-600" }),
          confirmClass: "bg-red-600 hover:bg-red-700 text-white",
          iconBg: "bg-red-100"
        }
      case "warning":
        return {
          icon: React.createElement(AlertCircle, { className: "h-6 w-6 text-yellow-600" }),
          confirmClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
          iconBg: "bg-yellow-100"
        }
      default:
        return {
          icon: React.createElement(Info, { className: "h-6 w-6 text-blue-600" }),
          confirmClass: "bg-blue-600 hover:bg-blue-700 text-white",
          iconBg: "bg-blue-100"
        }
    }
  }, [variant])

  const variantStyles = getVariantStyles()

  return React.createElement(
    Dialog,
    { open, onOpenChange, ...props },
    React.createElement(
      DialogContent,
      { ref, className: cn("sm:max-w-md", className) },
      React.createElement(
        DialogHeader,
        null,
        React.createElement(
          "div",
          { className: "flex items-center gap-4" },
          React.createElement(
            "div",
            { className: cn("p-3 rounded-full", variantStyles.iconBg) },
            icon || variantStyles.icon
          ),
          React.createElement(
            "div",
            { className: "flex-1" },
            React.createElement(DialogTitle, { className: "text-right" }, title),
            React.createElement(
              DialogDescription,
              { className: "text-right mt-2" },
              description
            )
          )
        )
      ),
      React.createElement(
        DialogFooter,
        { className: "gap-2 sm:gap-0" },
        React.createElement(
          "button",
          {
            onClick: onCancel,
            className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          },
          cancelText
        ),
        React.createElement(
          "button",
          {
            onClick: onConfirm,
            className: cn(
              "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors",
              variantStyles.confirmClass
            )
          },
          confirmText
        )
      )
    )
  )
})
ConfirmationDialog.displayName = "ConfirmationDialog"

// Success Dialog Component
const SuccessDialog = React.forwardRef<HTMLDivElement, SuccessDialogProps>(({
  open,
  onOpenChange,
  title = "تم بنجاح!",
  description = "تمت العملية بنجاح.",
  buttonText = "موافق",
  onClose,
  className,
  ...props
}, ref) => {
  return React.createElement(
    Dialog,
    { open, onOpenChange, ...props },
    React.createElement(
      DialogContent,
      { ref, className: cn("sm:max-w-md", className) },
      React.createElement(
        DialogHeader,
        null,
        React.createElement(
          "div",
          { className: "flex flex-col items-center gap-4 text-center" },
          React.createElement(
            "div",
            { className: "p-4 bg-green-100 rounded-full" },
            React.createElement(CheckCircle, { className: "h-8 w-8 text-green-600" })
          ),
          React.createElement(
            "div",
            null,
            React.createElement(DialogTitle, { className: "text-xl text-green-800" }, title),
            React.createElement(
              DialogDescription,
              { className: "mt-2 text-green-600" },
              description
            )
          )
        )
      ),
      React.createElement(
        DialogFooter,
        null,
        React.createElement(
          "button",
          {
            onClick: onClose,
            className: "w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          },
          buttonText
        )
      )
    )
  )
})
SuccessDialog.displayName = "SuccessDialog"

// Campaign Preview Dialog
const CampaignPreviewDialog = React.forwardRef<HTMLDivElement, CampaignPreviewDialogProps>(({
  open,
  onOpenChange,
  campaign,
  onEdit,
  onLaunch,
  className,
  ...props
}, ref) => {
  if (!campaign) return null

  return React.createElement(
    Dialog,
    { open, onOpenChange, ...props },
    React.createElement(
      DialogContent,
      { ref, className: cn("sm:max-w-2xl max-h-[80vh] overflow-y-auto", className) },
      React.createElement(
        DialogHeader,
        null,
        React.createElement(DialogTitle, { className: "text-xl" }, "معاينة الحملة الإعلانية"),
        React.createElement(
          DialogDescription,
          null,
          "راجع تفاصيل حملتك قبل الإطلاق"
        )
      ),
      React.createElement(
        "div",
        { className: "space-y-6" },
        // Campaign Basic Info
        React.createElement(
          "div",
          { className: "bg-gray-50 rounded-lg p-4" },
          React.createElement("h3", { className: "font-semibold text-gray-900 mb-3" }, "المعلومات الأساسية"),
          React.createElement(
            "div",
            { className: "grid grid-cols-2 gap-4 text-sm" },
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-gray-600" }, "اسم الحملة:"),
              React.createElement("p", { className: "font-medium" }, campaign.name)
            ),
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-gray-600" }, "نوع الحملة:"),
              React.createElement("p", { className: "font-medium" }, campaign.type)
            ),
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-gray-600" }, "الميزانية اليومية:"),
              React.createElement("p", { className: "font-medium text-green-600" }, `$${campaign.budget}`)
            ),
            React.createElement(
              "div",
              null,
              React.createElement("span", { className: "text-gray-600" }, "الموقع الجغرافي:"),
              React.createElement("p", { className: "font-medium" }, campaign.location)
            )
          )
        ),
        // Ad Previews
        campaign.ads && React.createElement(
          "div",
          null,
          React.createElement("h3", { className: "font-semibold text-gray-900 mb-3" }, "معاينة الإعلانات"),
          React.createElement(
            "div",
            { className: "space-y-3" },
            ...campaign.ads.map((ad, index) => 
              React.createElement(
                "div",
                { key: index, className: "border border-gray-200 rounded-lg p-4 bg-white" },
                React.createElement(
                  "div",
                  { className: "flex items-start gap-3" },
                  React.createElement(
                    "div",
                    { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm" },
                    String.fromCharCode(65 + index)
                  ),
                  React.createElement(
                    "div",
                    { className: "flex-1" },
                    React.createElement(
                      "h4",
                      { className: "font-medium text-blue-600 hover:underline cursor-pointer" },
                      ad.headline
                    ),
                    React.createElement("p", { className: "text-sm text-gray-600 mt-1" }, ad.description),
                    React.createElement("p", { className: "text-xs text-green-600 mt-1" }, ad.url)
                  )
                )
              )
            )
          )
        ),
        // Keywords
        campaign.keywords && React.createElement(
          "div",
          null,
          React.createElement("h3", { className: "font-semibold text-gray-900 mb-3" }, "الكلمات المفتاحية"),
          React.createElement(
            "div",
            { className: "flex flex-wrap gap-2" },
            ...campaign.keywords.map((keyword, index) => 
              React.createElement(
                "span",
                {
                  key: index,
                  className: "px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                },
                keyword
              )
            )
          )
        ),
        // Performance Predictions
        React.createElement(
          "div",
          { className: "bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4" },
          React.createElement("h3", { className: "font-semibold text-gray-900 mb-3" }, "التوقعات الأولية"),
          React.createElement(
            "div",
            { className: "grid grid-cols-3 gap-4 text-center" },
            React.createElement(
              "div",
              null,
              React.createElement(
                "p",
                { className: "text-2xl font-bold text-blue-600" },
                Math.round(campaign.budget * 2.5)
              ),
              React.createElement("p", { className: "text-xs text-gray-600" }, "نقرة متوقعة")
            ),
            React.createElement(
              "div",
              null,
              React.createElement(
                "p",
                { className: "text-2xl font-bold text-purple-600" },
                Math.round(campaign.budget * 125)
              ),
              React.createElement("p", { className: "text-xs text-gray-600" }, "ظهور متوقع")
            ),
            React.createElement(
              "div",
              null,
              React.createElement(
                "p",
                { className: "text-2xl font-bold text-green-600" },
                Math.round(campaign.budget * 0.15)
              ),
              React.createElement("p", { className: "text-xs text-gray-600" }, "تحويل متوقع")
            )
          )
        )
      ),
      React.createElement(
        DialogFooter,
        { className: "gap-2" },
        React.createElement(
          "button",
          {
            onClick: onEdit,
            className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          },
          "تعديل"
        ),
        React.createElement(
          "button",
          {
            onClick: onLaunch,
            className: "px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          },
          "إطلاق الحملة"
        )
      )
    )
  )
})
CampaignPreviewDialog.displayName = "CampaignPreviewDialog"

// File Upload Dialog
const FileUploadDialog = React.forwardRef<HTMLDivElement, FileUploadDialogProps>(({
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
  const [files, setFiles] = React.useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files).slice(0, maxFiles)
    setFiles(droppedFiles)
  }, [maxFiles])

  const handleFileSelect = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).slice(0, maxFiles)
    setFiles(selectedFiles)
  }, [maxFiles])

  const handleUpload = React.useCallback(() => {
    onFilesSelected?.(files)
    setFiles([])
    onOpenChange?.(false)
  }, [files, onFilesSelected, onOpenChange])

  return React.createElement(
    Dialog,
    { open, onOpenChange, ...props },
    React.createElement(
      DialogContent,
      { ref, className: cn("sm:max-w-md", className) },
      React.createElement(
        DialogHeader,
        null,
        React.createElement(DialogTitle, null, title),
        React.createElement(DialogDescription, null, description)
      ),
      React.createElement(
        "div",
        { className: "space-y-4" },
        React.createElement(
          "div",
          {
            className: cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            ),
            onDragEnter: handleDrag,
            onDragLeave: handleDrag,
            onDragOver: handleDrag,
            onDrop: handleDrop,
            onClick: () => fileInputRef.current?.click()
          },
          React.createElement("input", {
            ref: fileInputRef,
            type: "file",
            multiple: true,
            accept: acceptedTypes,
            onChange: handleFileSelect,
            className: "hidden"
          }),
          React.createElement(
            "div",
            { className: "space-y-2" },
            React.createElement(
              "div",
              { className: "text-gray-600" },
              React.createElement(
                "svg",
                { className: "mx-auto h-12 w-12", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48" },
                React.createElement("path", {
                  d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                })
              )
            ),
            React.createElement(
              "div",
              { className: "text-sm" },
              React.createElement(
                "span",
                { className: "font-medium text-blue-600 hover:text-blue-500 cursor-pointer" },
                "انقر لاختيار الملفات"
              ),
              React.createElement("span", { className: "text-gray-500" }, " أو اسحب الملفات هنا")
            ),
            React.createElement(
              "p",
              { className: "text-xs text-gray-500" },
              `الحد الأقصى ${maxFiles} ملفات`
            )
          )
        ),
        files.length > 0 && React.createElement(
          "div",
          { className: "space-y-2" },
          React.createElement("h4", { className: "text-sm font-medium" }, "الملفات المحددة:"),
          ...files.map((file, index) => 
            React.createElement(
              "div",
              { key: index, className: "flex items-center justify-between p-2 bg-gray-50 rounded" },
              React.createElement("span", { className: "text-sm truncate" }, file.name),
              React.createElement(
                "button",
                {
                  onClick: () => setFiles(files.filter((_, i) => i !== index)),
                  className: "text-red-500 hover:text-red-700"
                },
                React.createElement(X, { className: "h-4 w-4" })
              )
            )
          )
        )
      ),
      React.createElement(
        DialogFooter,
        { className: "gap-2" },
        React.createElement(
          "button",
          {
            onClick: () => onOpenChange?.(false),
            className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          },
          "إلغاء"
        ),
        React.createElement(
          "button",
          {
            onClick: handleUpload,
            disabled: files.length === 0,
            className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          },
          "رفع الملفات"
        )
      )
    )
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

