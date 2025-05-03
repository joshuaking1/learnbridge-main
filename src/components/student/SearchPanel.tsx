import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUp, ArrowDown, BookOpen } from "lucide-react";

interface ContentChunk {
  id: number;
  chunk_index: number;
  content: string;
  source_document_name: string;
}

interface SearchPanelProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  searchResults: number[];
  contentChunks: ContentChunk[];
}

export function SearchPanel({ 
  searchQuery, 
  onSearch, 
  searchResults, 
  contentChunks 
}: SearchPanelProps) {
  const [selectedResult, setSelectedResult] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleResultClick = (index: number) => {
    setSelectedResult(index);
    // Scroll to the result in the main content
    const element = document.getElementById(`chunk-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("highlight");
      setTimeout(() => {
        element.classList.remove("highlight");
      }, 2000);
    }
  };

  const navigateResults = (direction: "next" | "prev") => {
    if (searchResults.length === 0) return;

    if (selectedResult === null) {
      setSelectedResult(searchResults[0]);
      handleResultClick(searchResults[0]);
      return;
    }

    const currentIndex = searchResults.indexOf(selectedResult);
    let newIndex: number;

    if (direction === "next") {
      newIndex = currentIndex + 1 >= searchResults.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? searchResults.length - 1 : currentIndex - 1;
    }

    setSelectedResult(searchResults[newIndex]);
    handleResultClick(searchResults[newIndex]);
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search in content..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Navigation Controls */}
            {searchResults.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  {searchResults.length} results found
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateResults("prev")}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateResults("next")}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Results List */}
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {searchResults.map((index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedResult === index
                        ? "bg-brand-orange/10 border-brand-orange"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                    onClick={() => handleResultClick(index)}
                  >
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-slate-400 mt-1" />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            Page {Math.floor(index / 2) + 1}
                          </Badge>
                          <span className="text-sm text-slate-500">
                            Result {searchResults.indexOf(index) + 1} of{" "}
                            {searchResults.length}
                          </span>
                        </div>
                        <p className="text-slate-700">
                          {contentChunks[index].content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Search className="h-8 w-8 mx-auto mb-2" />
                    <p>No results found</p>
                    <p className="text-sm">Try different search terms</p>
                  </div>
                )}

                {!searchQuery && (
                  <div className="text-center py-8 text-slate-500">
                    <Search className="h-8 w-8 mx-auto mb-2" />
                    <p>Enter a search term to begin</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 