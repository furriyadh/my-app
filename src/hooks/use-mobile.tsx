import { useMediaQuery } from "react-responsive"
import { useEffect, useState } from "react"

export function useIsMobile() {
  const isMobileQuery = useMediaQuery({ maxWidth: 1023 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(isMobileQuery)
  }, [isMobileQuery])

  return isMobile
}
