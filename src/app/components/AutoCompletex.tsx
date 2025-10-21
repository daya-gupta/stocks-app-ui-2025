'use client';

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
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
import nseData from './../../../misc/NSE.json';

interface StockData {
  name: string;
  segment: string;
  instrument_type: string;
  exchange: string;
  isin: string;
  instrument_key: string;
}

interface MarketPrice {
  price: number;
  change: number;
  changePercent: number;
}

const filteredNSEData = nseData.filter(
  (item: StockData) => item.segment === 'NSE_EQ' && item.instrument_type === 'EQ'
);

// const filteredNSEData = [
//   {
//     value: "next.js",
//     label: "Next.js",
//     name: "Next.js",
//     isin: "isin-001",
//   },
//   {
//     value: "sveltekit",
//     label: "SvelteKit",
//     name: "SvelteKit",
//     isin: "isin-002",
//   },
//   {
//     value: "nuxt.js",
//     label: "Nuxt.js",
//     name: "Nuxt.js",
//     isin: "isin-003",
//   },
//   {
//     value: "remix",
//     label: "Remix",
//     name: "Remix",
//     isin: "isin-004",
//   },
//   {
//     value: "astro",
//     label: "Astro",
//     name: "Astro",
//     isin: "isin-005",
//   },
// ]

const AutoCompletex = () => {
  const [open, setOpen] = React.useState(false)
  const [selectedStock, setSelectedStock] = React.useState<StockData | null>(null);
  const [marketPrice, setMarketPrice] = React.useState<MarketPrice | null>(null);
  const [priceLoading, setPriceLoading] = React.useState(false);

  const fetchMarketPrice = async (isin: string) => {
    setPriceLoading(true);
    try {
      const response = await fetch(`/api/marketPrice?isin=${isin}`);
      const data = await response.json();
      setMarketPrice({
        price: data.price,
        change: data.change,
        changePercent: data.changePercent
      });
    } catch (error) {
      console.error('Error fetching market price:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedStock ? selectedStock.name : "Select stock..."}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search stocks..." />
            <CommandList>
              <CommandEmpty>No stocks found.</CommandEmpty>
              <CommandGroup heading="Stocks">
                {filteredNSEData.map((stock) => (
                  <CommandItem
                    key={stock.isin}
                    value={stock.name}
                    onSelect={() => {
                      setSelectedStock(stock)
                      fetchMarketPrice(stock.isin)
                      setOpen(false)
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedStock?.isin === stock.isin ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{stock.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {stock.isin}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedStock && (
        <div className="p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{selectedStock.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedStock.isin}
              </p>
            </div>
            {priceLoading ? (
              <div className="w-5 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
            ) : marketPrice && (
              <div className="text-right">
                <div className="text-lg font-bold">₹{marketPrice.price.toFixed(2)}</div>
                <div className={`text-sm ${marketPrice.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marketPrice.change >= 0 ? '↑' : '↓'} {Math.abs(marketPrice.change).toFixed(2)} 
                  <span className="ml-1">({marketPrice.changePercent.toFixed(2)}%)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoCompletex;

// Add this component to your top banner
// const TopBanner = () => {
//   return (
//     <div className="flex items-center justify-between px-4 py-2 bg-white shadow-md">
//       <div className="flex items-center space-x-4">
//         <h1 className="text-xl font-bold">Your Logo</h1>
//         <AutoComplete />
//       </div>
//       {/* Other banner content */}
//     </div>
//   );
// };

// export default TopBanner;