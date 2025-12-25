import React, { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MOBILE_BRANDS } from '@/data/mobileDevices';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceModelSelectorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
}

const DeviceModelSelector: React.FC<DeviceModelSelectorProps> = ({ value, onChange, className, disabled }) => {
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [openModel, setOpenModel] = useState(false);

    // Parse initial value if it exists
    useEffect(() => {
        if (value) {
            // Try to find if value starts with a known brand
            const brand = Object.keys(MOBILE_BRANDS).find(b => value.toLowerCase().startsWith(b.split(' / ')[0].toLowerCase()));

            if (brand) {
                setSelectedBrand(brand);
                setSelectedModel(value);
            } else {
                // Fallback: Try to find which brand's list contains this value
                const foundBrand = Object.keys(MOBILE_BRANDS).find(b =>
                    MOBILE_BRANDS[b].some(m => value.includes(m))
                );
                if (foundBrand) {
                    setSelectedBrand(foundBrand);
                    setSelectedModel(value);
                }
            }
        }
    }, []);

    const handleBrandChange = (brand: string) => {
        setSelectedBrand(brand);
        setSelectedModel(''); // Reset model when brand changes
        onChange(`${brand}`); // Partial update
        setOpenModel(true); // Auto open model select
    };

    const handleModelSelect = (model: string) => {
        // Logic to format final string
        let finalString = model;
        // If the model string doesn't start with Brand (and Brand isn't "Xiaomi / Redmi" complex case)
        const brandSimple = selectedBrand.split(' / ')[0];

        if (!model.toLowerCase().includes(brandSimple.toLowerCase())) {
            finalString = `${brandSimple} ${model}`;
        }

        setSelectedModel(finalString);
        onChange(finalString);
        setOpenModel(false);
    };

    return (
        <div className={`grid grid-cols-2 gap-4 ${className}`}>
            <div className="space-y-2">
                <Label>Brand</Label>
                <Select value={selectedBrand} onValueChange={handleBrandChange} disabled={disabled}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(MOBILE_BRANDS).map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Model</Label>
                <Popover open={openModel} onOpenChange={setOpenModel}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openModel}
                            className="w-full justify-between"
                            disabled={!selectedBrand || disabled}
                        >
                            {selectedModel ? (
                                // Display logic: show full model name without brand redundancy if clear
                                selectedModel.replace(selectedBrand.split(' / ')[0], '').trim() || selectedModel
                            ) : (
                                selectedBrand ? "Select Model..." : "Choose Brand first"
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder={`Search ${selectedBrand} models...`} />
                            <CommandList>
                                <CommandEmpty>No model found.</CommandEmpty>
                                <CommandGroup>
                                    {selectedBrand && MOBILE_BRANDS[selectedBrand]?.map((model) => (
                                        <CommandItem
                                            key={model}
                                            value={model}
                                            onSelect={(currentValue) => {
                                                // CommandItem usually returns lowercase value, so we use original model string from map
                                                handleModelSelect(model);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedModel.includes(model) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {model}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

export default DeviceModelSelector;
