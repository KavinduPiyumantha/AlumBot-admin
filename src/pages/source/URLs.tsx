import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Loading from "@/components/loading";
import { Alert } from "@/components/ui/alert";
import { submitIsolatedUrls, getIsolatedUrlList, deleteIsolatedUrlList } from "@/api";
import deleteIcon from "@/assets/delete.svg";

export const URLs = () => {
  const [urls, setUrls] = useState<API.IsolatedUrl[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing isolated URLs when component mounts
  useEffect(() => {
    fetchIsolatedUrls();
  }, []);

  const fetchIsolatedUrls = async () => {
    try {
      setIsLoading(true);
      const response = await getIsolatedUrlList();
      if (response.retcode === 0) {
        setUrls(response.data.url_list || []);
      } else {
        console.error("Failed to fetch URLs:", response.message);
      }
    } catch (err) {
      console.error("Error fetching URLs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!urlInput.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Parse URLs from textarea input (one per line)
      const urlList = urlInput
        .split('\n')
        .map(url => url.trim())
        .filter(url => url !== '');
      
      // Submit URLs
      const response = await submitIsolatedUrls(urlList);
      
      if (response.retcode === 0) {
        // Clear input
        setUrlInput('');
        setSuccessMessage(`Successfully submitted ${urlList.length} URL(s).`);
        // Refresh URL list
        fetchIsolatedUrls();
      } else {
        throw new Error(response.message || "Submission failed");
      }
    } catch (err) {
      console.error("Error submitting URLs:", err);
      setError(err instanceof Error ? err.message : "Failed to submit URLs. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUrl = async (urlId: number) => {
    try {
      setIsDeleting(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await deleteIsolatedUrlList([urlId]);
      
      if (response.retcode === 0) {
        setSuccessMessage("URL deletion initiated successfully.");
        // Refresh the list after deletion
        setTimeout(() => {
          fetchIsolatedUrls();
        }, 1000);
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (err) {
      console.error("Error deleting URL:", err);
      setError(err instanceof Error ? err.message : "Failed to delete URL. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter URLs based on search input
  const filteredUrls = urls.filter(url => 
    url.url.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="mt-[5vh]">
      <div className="mb-10 rounded border border-zinc-200">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h3 className="text-xl font-semibold leading-6 text-zinc-900">
            IsolatedUrl
          </h3>
        </div>
        <div className="p-5">
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              {successMessage}
            </Alert>
          )}
          
          <div className="mb-3">
            <div className="text-sm mb-1">Url</div>
            <Textarea
              placeholder="Enter each URL in a new line. This will crawl all the links starting with the URL."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              Enter each URL in a new line. This will crawl all the links starting with the URL.
            </p>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !urlInput.trim()}
            >
              {isSubmitting ? <Loading /> : 'Submit'}
            </Button>
          </div>
        </div>
      </div>

      {/* URL List Section */}
      <div className="rounded border border-zinc-200">
        <div className="border-b border-zinc-200 px-5 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-zinc-900">
            Included Urls
          </h3>
        </div>
        
        <div className="p-5">
          {isLoading ? (
            <div className="flex justify-center my-4">
              <Loading />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Input 
                  placeholder="Filter url..." 
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="max-w-full"
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 w-8">
                        <input type="checkbox" disabled />
                      </th>
                      <th className="text-left py-2 px-4">Url</th>
                      <th className="text-left py-2 px-4">Size</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUrls.length > 0 ? (
                      filteredUrls.map((url) => (
                        <tr key={url.id} className="border-b">
                          <td className="py-2 px-4">
                            <input type="checkbox" />
                          </td>
                          <td className="py-2 px-4 max-w-md truncate">{url.url}</td>
                          <td className="py-2 px-4">{url.content_length || 0}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              url.doc_status === 4 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {url.doc_status === 4 ? 'Trained' : 'Processing'}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <button 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteUrl(url.id)}
                              disabled={isDeleting}
                            >
                              <img src={deleteIcon} alt="delete" width={16} height={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-500">
                          No results.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {filteredUrls.length} total
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};