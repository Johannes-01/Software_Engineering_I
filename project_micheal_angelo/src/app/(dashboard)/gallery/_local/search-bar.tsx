import React, { useState } from 'react';
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select"
import useSWR from "swr";
import { Category } from "@type/category";
import Link from "next/link";

interface SearchBarProps {
    userIsAdmin?: boolean
    currentPage: number
    setImageQuery: (query: string) => void
    users: { id: string, email: string }[]
    setSelectedUser: (user: { id: string, email: string } | undefined) => void
}

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`An error occurred while fetching the data from ${url}`);
    }
    return response.json();
};

const SearchBar: React.FC<SearchBarProps> = ({
    userIsAdmin,
    currentPage,
    setImageQuery,
    users,
    setSelectedUser,
}) => {
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [artist, setArtist] = useState<string>("")
    const [selectedCategory, setSelectedCategory] = useState(0)

    const { data: availableCategories } = useSWR<Category[]>("/api/category", fetcher);

    const buildImageQuery = () => {
        const params = new URLSearchParams();

        params.append('p', currentPage.toString());

        if (searchTerm) {
            params.append('q', searchTerm);
        }

        if (artist) {
            params.append('a', artist);
        }

        if (selectedCategory !== 0) {
            params.append('c', selectedCategory.toString());
        }

        return `/api/image?${params.toString()}`;
    };

    console.log(selectedCategory)

    return (
        <div className={"w-full"}>
            <div className="flex gap-4 mb-2 w-full">
                <div className="w-4/5 flex gap-2">
                    <Input
                        placeholder="Search artworks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                    />
                    <Input
                        placeholder="Search for artist..."
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        className="flex-1"
                    />
                </div>

                <div className="w-3/20">
                    <Select onValueChange={(value: string) => setSelectedCategory(Number(value))}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Category"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Alle</SelectItem>
                            {availableCategories?.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id.toString()}
                                >
                                    {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-1/20">
                    <Button
                        className="w-full"
                        onClick={() => setImageQuery(buildImageQuery())}
                    >
                        Search
                    </Button>
                </div>
            </div>

            {userIsAdmin && <div className="w-full flex justify-between">
                <div className="w-3/20">
                    {users && (
                        <Select onValueChange={(value: string) => {
                            setSelectedUser(users.find((user) => user.id ===  value))
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="No User"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="no">No User</SelectItem>
                                {users.map((user) => (
                                    <SelectItem
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <Link href={"category/"}>
                    <Button>
                        Add
                    </Button>
                </Link>
            </div>}
        </div>
    );
};

export default SearchBar;
