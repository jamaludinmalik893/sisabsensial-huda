
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface GuruSearchProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const GuruSearch: React.FC<GuruSearchProps> = ({ searchTerm, onSearchChange }) => {
    return (
        <Card>
            <CardContent className="pt-6">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                placeholder="Cari guru (nama, NIP, atau email)..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
                />
            </div>
            </CardContent>
        </Card>
    )
}

export default GuruSearch;
