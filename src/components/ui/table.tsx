import * as React from "react"
import { cn } from "../../lib/utils"
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  Search, 
  Filter, 
  Download, 
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  ArrowUpDown
} from "lucide-react"

// Type definitions
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  className?: string;
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  className?: string;
}

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  cellClassName?: string;
}

interface DataTableProps {
  data?: any[];
  columns?: Column[];
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  onRowClick?: (row: any) => void;
}

interface CampaignTableProps {
  campaigns?: any[];
  onCampaignClick?: (campaign: any) => void;
  className?: string;
}

interface KeywordsTableProps {
  keywords?: any[];
  className?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, ...props }, ref) => 
  React.createElement(
    "div",
    { className: "relative w-full overflow-auto" },
    React.createElement("table", {
      ref,
      className: cn("w-full caption-bottom text-sm", className),
      ...props
    })
  )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(({ className, ...props }, ref) => 
  React.createElement("thead", {
    ref,
    className: cn("[&_tr]:border-b", className),
    ...props
  })
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(({ className, ...props }, ref) => 
  React.createElement("tbody", {
    ref,
    className: cn("[&_tr:last-child]:border-0", className),
    ...props
  })
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(({ className, ...props }, ref) => 
  React.createElement("tfoot", {
    ref,
    className: cn(
      "border-t bg-gray-50/50 font-medium [&>tr]:last:border-b-0",
      className
    ),
    ...props
  })
)
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(({ className, ...props }, ref) => 
  React.createElement("tr", {
    ref,
    className: cn(
      "border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50",
      className
    ),
    ...props
  })
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(({ className, ...props }, ref) => 
  React.createElement("th", {
    ref,
    className: cn(
      "h-12 px-4 text-right align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0",
      className
    ),
    ...props
  })
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(({ className, ...props }, ref) => 
  React.createElement("td", {
    ref,
    className: cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className),
    ...props
  })
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(({ className, ...props }, ref) => 
  React.createElement("caption", {
    ref,
    className: cn("mt-4 text-sm text-gray-500", className),
    ...props
  })
)
TableCaption.displayName = "TableCaption"

// Advanced Data Table Component
const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(({
  data = [],
  columns = [],
  searchable = true,
  sortable = true,
  filterable = true,
  exportable = true,
  pagination = true,
  pageSize = 10,
  className,
  onRowClick,
  ...props
}, ref) => {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortConfig, setSortConfig] = React.useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  const [currentPage, setCurrentPage] = React.useState(1)
  const [filters, setFilters] = React.useState<Record<string, string>>({})

  // Filter and search data
  const filteredData = React.useMemo(() => {
    let filtered = data

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(column =>
          String(row[column.key] || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => 
          String(row[key] || "").toLowerCase().includes(value.toLowerCase())
        )
      }
    })

    return filtered
  }, [data, searchTerm, filters, columns])

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData
    
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = React.useCallback((key: string) => {
    if (!sortable) return
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [sortable])

  const handleExport = React.useCallback(() => {
    const csv = [
      columns.map(col => col.header).join(','),
      ...sortedData.map(row => 
        columns.map(col => `"${row[col.key] || ''}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }, [columns, sortedData])

  const getSortIcon = React.useCallback((columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return React.createElement(ChevronsUpDown, { className: "h-4 w-4 text-gray-400" })
    }
    return sortConfig.direction === 'asc' 
      ? React.createElement(ChevronUp, { className: "h-4 w-4 text-blue-600" })
      : React.createElement(ChevronDown, { className: "h-4 w-4 text-blue-600" })
  }, [sortConfig])

  return React.createElement(
    "div",
    { ref, className: cn("space-y-4", className), ...props },
    // Table Controls
    React.createElement(
      "div",
      { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" },
      React.createElement(
        "div",
        { className: "flex flex-col sm:flex-row gap-2 flex-1" },
        searchable && React.createElement(
          "div",
          { className: "relative" },
          React.createElement(Search, { className: "absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
          React.createElement("input", {
            type: "text",
            placeholder: "البحث في البيانات...",
            value: searchTerm,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
            className: "pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
          })
        ),
        filterable && React.createElement(
          "button",
          { className: "flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" },
          React.createElement(Filter, { className: "h-4 w-4" }),
          "فلترة"
        )
      ),
      React.createElement(
        "div",
        { className: "flex gap-2" },
        exportable && React.createElement(
          "button",
          {
            onClick: handleExport,
            className: "flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          },
          React.createElement(Download, { className: "h-4 w-4" }),
          "تصدير"
        )
      )
    ),
    // Table
    React.createElement(
      "div",
      { className: "rounded-lg border border-gray-200 bg-white shadow-sm" },
      React.createElement(
        Table,
        null,
        React.createElement(
          TableHeader,
          null,
          React.createElement(
            TableRow,
            { className: "bg-gray-50" },
            ...columns.map((column) => 
              React.createElement(
                TableHead,
                {
                  key: column.key,
                  className: cn(
                    "font-semibold text-gray-900",
                    sortable && "cursor-pointer hover:bg-gray-100 transition-colors",
                    column.className
                  ),
                  onClick: () => handleSort(column.key)
                },
                React.createElement(
                  "div",
                  { className: "flex items-center gap-2 justify-end" },
                  column.header,
                  sortable && getSortIcon(column.key)
                )
              )
            )
          )
        ),
        React.createElement(
          TableBody,
          null,
          paginatedData.length === 0 ? React.createElement(
            TableRow,
            null,
            React.createElement(
              TableCell,
              { colSpan: columns.length, className: "text-center py-8 text-gray-500" },
              "لا توجد بيانات للعرض"
            )
          ) : paginatedData.map((row, index) => 
            React.createElement(
              TableRow,
              {
                key: index,
                className: cn(
                  onRowClick && "cursor-pointer hover:bg-blue-50"
                ),
                onClick: () => onRowClick?.(row)
              },
              ...columns.map((column) => 
                React.createElement(
                  TableCell,
                  { key: column.key, className: column.cellClassName },
                  column.render ? column.render(row[column.key], row) : row[column.key]
                )
              )
            )
          )
        )
      )
    ),
    // Pagination
    pagination && totalPages > 1 && React.createElement(
      "div",
      { className: "flex items-center justify-between" },
      React.createElement(
        "div",
        { className: "text-sm text-gray-700" },
        `عرض ${((currentPage - 1) * pageSize) + 1} إلى ${Math.min(currentPage * pageSize, sortedData.length)} من ${sortedData.length} نتيجة`
      ),
      React.createElement(
        "div",
        { className: "flex items-center gap-2" },
        React.createElement(
          "button",
          {
            onClick: () => setCurrentPage(prev => Math.max(prev - 1, 1)),
            disabled: currentPage === 1,
            className: "px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          },
          "السابق"
        ),
        ...Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1
          return React.createElement(
            "button",
            {
              key: page,
              onClick: () => setCurrentPage(page),
              className: cn(
                "px-3 py-1 border rounded",
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 hover:bg-gray-50"
              )
            },
            page
          )
        }),
        React.createElement(
          "button",
          {
            onClick: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)),
            disabled: currentPage === totalPages,
            className: "px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          },
          "التالي"
        )
      )
    )
  )
})
DataTable.displayName = "DataTable"

// Campaign Performance Table
const CampaignTable = React.forwardRef<HTMLDivElement, CampaignTableProps>(({ campaigns = [], onCampaignClick, className, ...props }, ref) => {
  const formatCurrency = React.useCallback((amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }, [])

  const formatNumber = React.useCallback((num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num)
  }, [])

  const getPerformanceIcon = React.useCallback((change: number) => {
    if (change > 0) return React.createElement(TrendingUp, { className: "h-4 w-4 text-green-600" })
    if (change < 0) return React.createElement(TrendingDown, { className: "h-4 w-4 text-red-600" })
    return React.createElement(Minus, { className: "h-4 w-4 text-gray-400" })
  }, [])

  const getStatusBadge = React.useCallback((status: string) => {
    const statusConfig = {
      active: { label: "نشط", className: "bg-green-100 text-green-800" },
      paused: { label: "متوقف", className: "bg-yellow-100 text-yellow-800" },
      ended: { label: "منتهي", className: "bg-gray-100 text-gray-800" },
      draft: { label: "مسودة", className: "bg-blue-100 text-blue-800" }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

    return React.createElement(
      "span",
      { className: cn("px-2 py-1 rounded-full text-xs font-medium", config.className) },
      config.label
    )
  }, [])

  const columns: Column[] = [
    {
      key: "name",
      header: "اسم الحملة",
      render: (value, row) => React.createElement(
        "div",
        { className: "flex items-center gap-3" },
        React.createElement(
          "div",
          { className: "w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center" },
          React.createElement(
            "span",
            { className: "text-blue-600 font-semibold text-sm" },
            value?.charAt(0)?.toUpperCase()
          )
        ),
        React.createElement(
          "div",
          null,
          React.createElement("div", { className: "font-medium text-gray-900" }, value),
          React.createElement("div", { className: "text-sm text-gray-500" }, row.type)
        )
      )
    },
    {
      key: "status",
      header: "الحالة",
      render: (value) => getStatusBadge(value)
    },
    {
      key: "budget",
      header: "الميزانية",
      render: (value) => React.createElement(
        "div",
        { className: "text-right" },
        React.createElement("div", { className: "font-medium" }, formatCurrency(value)),
        React.createElement("div", { className: "text-sm text-gray-500" }, "يومياً")
      )
    },
    {
      key: "impressions",
      header: "الظهور",
      render: (value, row) => React.createElement(
        "div",
        { className: "text-right" },
        React.createElement("div", { className: "font-medium" }, formatNumber(value)),
        React.createElement(
          "div",
          { className: "flex items-center gap-1 text-sm" },
          getPerformanceIcon(row.impressionsChange),
          React.createElement(
            "span",
            {
              className: cn(
                row.impressionsChange > 0 ? "text-green-600" : 
                row.impressionsChange < 0 ? "text-red-600" : "text-gray-500"
              )
            },
            `${row.impressionsChange > 0 ? '+' : ''}${row.impressionsChange}%`
          )
        )
      )
    },
    {
      key: "clicks",
      header: "النقرات",
      render: (value, row) => React.createElement(
        "div",
        { className: "text-right" },
        React.createElement("div", { className: "font-medium" }, formatNumber(value)),
        React.createElement(
          "div",
          { className: "flex items-center gap-1 text-sm" },
          getPerformanceIcon(row.clicksChange),
          React.createElement(
            "span",
            {
              className: cn(
                row.clicksChange > 0 ? "text-green-600" : 
                row.clicksChange < 0 ? "text-red-600" : "text-gray-500"
              )
            },
            `${row.clicksChange > 0 ? '+' : ''}${row.clicksChange}%`
          )
        )
      )
    },
    {
      key: "ctr",
      header: "معدل النقر",
      render: (value, row) => React.createElement(
        "div",
        { className: "text-right" },
        React.createElement("div", { className: "font-medium" }, `${value}%`),
        React.createElement(
          "div",
          { className: "flex items-center gap-1 text-sm" },
          getPerformanceIcon(row.ctrChange),
          React.createElement(
            "span",
            {
              className: cn(
                row.ctrChange > 0 ? "text-green-600" : 
                row.ctrChange < 0 ? "text-red-600" : "text-gray-500"
              )
            },
            `${row.ctrChange > 0 ? '+' : ''}${row.ctrChange}%`
          )
        )
      )
    },
    {
      key: "cost",
      header: "التكلفة",
      render: (value, row) => React.createElement(
        "div",
        { className: "text-right" },
        React.createElement("div", { className: "font-medium" }, formatCurrency(value)),
        React.createElement("div", { className: "text-sm text-gray-500" }, `CPC: $${row.cpc}`)
      )
    },
    {
      key: "conversions",
      header: "التحويلات",
      render: (value, row) => React.createElement(
        "div",
        { className: "text-right" },
        React.createElement("div", { className: "font-medium" }, formatNumber(value)),
        React.createElement("div", { className: "text-sm text-gray-500" }, `معدل: ${row.conversionRate}%`)
      )
    },
    {
      key: "actions",
      header: "الإجراءات",
      render: (_, row) => React.createElement(
        "div",
        { className: "flex items-center gap-2" },
        React.createElement(
          "button",
          {
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation()
              // Handle view action
            },
            className: "p-1 hover:bg-gray-100 rounded"
          },
          React.createElement(Eye, { className: "h-4 w-4 text-gray-600" })
        ),
        React.createElement(
          "button",
          {
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation()
              // Handle more actions
            },
            className: "p-1 hover:bg-gray-100 rounded"
          },
          React.createElement(MoreHorizontal, { className: "h-4 w-4 text-gray-600" })
        )
      )
    }
  ]

  return React.createElement(DataTable, {
    ref,
    data: campaigns,
    columns,
    onRowClick: onCampaignClick,
    className,
    ...props
  })
})
CampaignTable.displayName = "CampaignTable"

// Keywords Performance Table
const KeywordsTable = React.forwardRef<HTMLDivElement, KeywordsTableProps>(({ keywords = [], className, ...props }, ref) => {
  const columns: Column[] = [
    {
      key: "keyword",
      header: "الكلمة المفتاحية",
      render: (value, row) => React.createElement(
        "div",
        null,
        React.createElement("div", { className: "font-medium" }, value),
        React.createElement("div", { className: "text-sm text-gray-500" }, row.matchType)
      )
    },
    {
      key: "impressions",
      header: "الظهور",
      render: (value) => new Intl.NumberFormat('ar-SA').format(value)
    },
    {
      key: "clicks",
      header: "النقرات",
      render: (value) => new Intl.NumberFormat('ar-SA').format(value)
    },
    {
      key: "ctr",
      header: "معدل النقر",
      render: (value) => `${value}%`
    },
    {
      key: "cpc",
      header: "تكلفة النقرة",
      render: (value) => `$${value}`
    },
    {
      key: "cost",
      header: "التكلفة",
      render: (value) => new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    },
    {
      key: "conversions",
      header: "التحويلات",
      render: (value) => new Intl.NumberFormat('ar-SA').format(value)
    },
    {
      key: "qualityScore",
      header: "نقاط الجودة",
      render: (value) => React.createElement(
        "div",
        { className: "flex items-center gap-2" },
        React.createElement(
          "span",
          {
            className: cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
              value >= 8 ? "bg-green-500" : value >= 6 ? "bg-yellow-500" : "bg-red-500"
            )
          },
          value
        )
      )
    }
  ]

  return React.createElement(DataTable, {
    ref,
    data: keywords,
    columns,
    className,
    ...props
  })
})
KeywordsTable.displayName = "KeywordsTable"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable,
  CampaignTable,
  KeywordsTable,
}

