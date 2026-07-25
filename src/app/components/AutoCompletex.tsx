'use client';

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, LoaderIcon } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { apiClient } from '@/lib/api'

interface StockData {
  trading_symbol: string
  company_name: string
  instrument_key: string
  isin: string
  segment: string
  exchange: string
  instrument_type: string
}

interface MarketPrice {
  price: number
  change: number
  changePercent: number
}

const AutoCompletex = ({ onSelect }: { onSelect: (stock: StockData) => void }) => {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<StockData[]>([])
  const [selectedStock, setSelectedStock] = React.useState<StockData | null>(null)
  const [marketPrice, setMarketPrice] = React.useState<MarketPrice | null>(null)
  const [isSearching, setIsSearching] = React.useState(false)
  const [priceLoading, setPriceLoading] = React.useState(false)
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSearchResults = React.useCallback(async (query: string) => {
    if (!query || query.trim().length < 1) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await apiClient.get(`/search-instruments?q=${encodeURIComponent(query)}`)
      setSearchResults(results || [])
    } catch (error) {
      console.error('Error searching instruments:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    // Debounce the search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchSearchResults(value)
    }, 300)
  }

  const fetchMarketPrice = async (isin: string) => {
    setPriceLoading(true)
    try {
      const response = await fetch(`/api/marketPrice?isin=${isin}`)
      const data = await response.json()
      setMarketPrice({
        price: data.price,
        change: data.change,
        changePercent: data.changePercent
      })
    } catch (error) {
      console.error('Error fetching market price:', error)
    } finally {
      setPriceLoading(false)
    }
  }

  const handleSelectStock = (stock: StockData) => {
    setSelectedStock(stock)
    onSelect(stock)
    fetchMarketPrice(stock.isin)
    setOpen(false)
    setSearchQuery("")
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 px-3 py-2 text-base"
          >
            <span className="truncate">
              {selectedStock ? `${selectedStock.trading_symbol} - ${selectedStock.company_name}` : "Select stock..."}
            </span>
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search by symbol, name, or ISIN..." 
              value={searchQuery}
              onValueChange={handleSearchChange}
              className="h-9"
            />
            <CommandList className="max-h-[300px]">
              {isSearching && (
                <div className="flex items-center justify-center py-6">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                </div>
              )}
              {!isSearching && searchResults.length === 0 && searchQuery && (
                <CommandEmpty>No stocks found.</CommandEmpty>
              )}
              {!isSearching && searchResults.length === 0 && !searchQuery && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Start typing to search...
                </div>
              )}
              {!isSearching && searchResults.length > 0 && (
                <CommandGroup heading="Stocks" className="overflow-hidden">
                  {searchResults.map((stock) => (
                    <CommandItem
                      key={stock.isin}
                      value={stock.trading_symbol}
                      onSelect={() => handleSelectStock(stock)}
                      className={cn(
                        "flex items-center px-2 py-2.5 cursor-pointer my-1 mx-1 rounded-md transition-colors",
                        selectedStock?.isin === stock.isin
                          ? "bg-blue-600 text-white font-semibold"
                          : "hover:bg-gray-100 data-[selected]:bg-gray-100"
                      )}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4 flex-shrink-0",
                          selectedStock?.isin === stock.isin ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-semibold truncate">{stock.trading_symbol}</span>
                        <span className={cn(
                          "text-xs truncate",
                          selectedStock?.isin === stock.isin ? "text-blue-100" : "text-muted-foreground"
                        )}>
                          {stock.company_name} • {stock.isin}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedStock && (
        <div className="p-4 rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{selectedStock.trading_symbol}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedStock.company_name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedStock.isin}
              </p>
            </div>
            {priceLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : marketPrice && (
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-gray-900">₹{marketPrice.price.toFixed(2)}</div>
                <div className={cn(
                  "text-sm font-semibold mt-1",
                  marketPrice.change >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {marketPrice.change >= 0 ? '↑' : '↓'} {Math.abs(marketPrice.change).toFixed(2)}
                  <span className="ml-1">({marketPrice.changePercent.toFixed(2)}%)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AutoCompletex
