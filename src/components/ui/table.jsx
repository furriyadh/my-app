import * as React from "react"
import { cn } from "@/lib/utils"
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

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-gray-50/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-right align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-gray-500", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// Advanced Data Table Component
const DataTable = React.forwardRef(({
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
  const [sortConfig, setSortConfig] = React.useState({ key: null, direction: null })
  const [currentPage, setCurrentPage] = React.useState(1)
  const [filters, setFilters] = React.useState({})

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
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

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

  const handleSort = (key) => {
    if (!sortable) return
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleExport = () => {
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
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-600" />
      : <ChevronDown className="h-4 w-4 text-blue-600" />
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          {searchable && (
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في البيانات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
            </div>
          )}
          
          {filterable && (
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              فلترة
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {exportable && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              تصدير
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table ref={ref}>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "font-semibold text-gray-900",
                    sortable && "cursor-pointer hover:bg-gray-100 transition-colors",
                    column.className
                  )}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2 justify-end">
                    {column.header}
                    {sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  لا توجد بيانات للعرض
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-blue-50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.cellClassName}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, sortedData.length)} من {sortedData.length} نتيجة
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "px-3 py-1 border rounded",
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {page}
                </button>
              )
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  )
})
DataTable.displayName = "DataTable"

// Campaign Performance Table
const CampaignTable = React.forwardRef(({ campaigns = [], onCampaignClick, className, ...props }, ref) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-SA').format(num)
  }

  const getPerformanceIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: "نشط", className: "bg-green-100 text-green-800" },
      paused: { label: "متوقف", className: "bg-yellow-100 text-yellow-800" },
      ended: { label: "منتهي", className: "bg-gray-100 text-gray-800" },
      draft: { label: "مسودة", className: "bg-blue-100 text-blue-800" }
    }

    const config = statusConfig[status] || statusConfig.draft

    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    )
  }

  const columns = [
    {
      key: "name",
      header: "اسم الحملة",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {value?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.type}</div>
          </div>
        </div>
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
      render: (value) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(value)}</div>
          <div className="text-sm text-gray-500">يومياً</div>
        </div>
      )
    },
    {
      key: "impressions",
      header: "الظهور",
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium">{formatNumber(value)}</div>
          <div className="flex items-center gap-1 text-sm">
            {getPerformanceIcon(row.impressionsChange)}
            <span className={cn(
              row.impressionsChange > 0 ? "text-green-600" : 
              row.impressionsChange < 0 ? "text-red-600" : "text-gray-500"
            )}>
              {row.impressionsChange > 0 ? '+' : ''}{row.impressionsChange}%
            </span>
          </div>
        </div>
      )
    },
    {
      key: "clicks",
      header: "النقرات",
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium">{formatNumber(value)}</div>
          <div className="flex items-center gap-1 text-sm">
            {getPerformanceIcon(row.clicksChange)}
            <span className={cn(
              row.clicksChange > 0 ? "text-green-600" : 
              row.clicksChange < 0 ? "text-red-600" : "text-gray-500"
            )}>
              {row.clicksChange > 0 ? '+' : ''}{row.clicksChange}%
            </span>
          </div>
        </div>
      )
    },
    {
      key: "ctr",
      header: "معدل النقر",
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium">{value}%</div>
          <div className="flex items-center gap-1 text-sm">
            {getPerformanceIcon(row.ctrChange)}
            <span className={cn(
              row.ctrChange > 0 ? "text-green-600" : 
              row.ctrChange < 0 ? "text-red-600" : "text-gray-500"
            )}>
              {row.ctrChange > 0 ? '+' : ''}{row.ctrChange}%
            </span>
          </div>
        </div>
      )
    },
    {
      key: "cost",
      header: "التكلفة",
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(value)}</div>
          <div className="text-sm text-gray-500">CPC: ${row.cpc}</div>
        </div>
      )
    },
    {
      key: "conversions",
      header: "التحويلات",
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium">{formatNumber(value)}</div>
          <div className="text-sm text-gray-500">معدل: {row.conversionRate}%</div>
        </div>
      )
    },
    {
      key: "actions",
      header: "الإجراءات",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Handle view action
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Handle more actions
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      )
    }
  ]

  return (
    <DataTable
      ref={ref}
      data={campaigns}
      columns={columns}
      onRowClick={onCampaignClick}
      className={className}
      {...props}
    />
  )
})
CampaignTable.displayName = "CampaignTable"

// Keywords Performance Table
const KeywordsTable = React.forwardRef(({ keywords = [], className, ...props }, ref) => {
  const columns = [
    {
      key: "keyword",
      header: "الكلمة المفتاحية",
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.matchType}</div>
        </div>
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
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
            value >= 8 ? "bg-green-500" : value >= 6 ? "bg-yellow-500" : "bg-red-500"
          )}>
            {value}
          </span>
        </div>
      )
    }
  ]

  return (
    <DataTable
      ref={ref}
      data={keywords}
      columns={columns}
      className={className}
      {...props}
    />
  )
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

