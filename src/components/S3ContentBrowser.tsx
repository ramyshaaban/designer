'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface S3ContentItem {
  key: string;
  size: number;
  lastModified: string;
  url: string;
}

interface S3ContentResponse {
  bucket: string;
  prefix: string;
  count: number;
  contents: S3ContentItem[];
}

export function S3ContentBrowser() {
  const [content, setContent] = useState<S3ContentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState('staycurrent-app-prod');
  const [selectedPrefix, setSelectedPrefix] = useState('content/');

  const buckets = [
    { name: 'staycurrent-app-prod', label: 'Production App' },
    { name: 'staycurrent-app-dev', label: 'Development App' },
    { name: 'gcmd-production', label: 'GCMD Production' },
  ];

  const prefixes = [
    { name: 'content/', label: 'Content' },
    { name: 'conferences/', label: 'Conferences' },
    { name: 'videos/', label: 'Videos' },
  ];

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/s3-content?bucket=${selectedBucket}&prefix=${selectedPrefix}&limit=20`
      );
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Failed to fetch S3 content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [selectedBucket, selectedPrefix]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (key: string) => {
    const ext = key.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['mp4', 'avi', 'mov', 'webm'].includes(ext || '')) return 'video';
    if (['pdf', 'doc', 'docx'].includes(ext || '')) return 'document';
    return 'file';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>S3 Content Browser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bucket Selection */}
          <div className="flex gap-2 flex-wrap">
            {buckets.map((bucket) => (
              <Button
                key={bucket.name}
                variant={selectedBucket === bucket.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBucket(bucket.name)}
              >
                {bucket.label}
              </Button>
            ))}
          </div>

          {/* Prefix Selection */}
          <div className="flex gap-2 flex-wrap">
            {prefixes.map((prefix) => (
              <Button
                key={prefix.name}
                variant={selectedPrefix === prefix.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPrefix(prefix.name)}
              >
                {prefix.label}
              </Button>
            ))}
          </div>

          <Button onClick={fetchContent} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardContent>
      </Card>

      {/* Content Display */}
      {content && (
        <Card>
          <CardHeader>
            <CardTitle>
              {content.count} items in {content.bucket}/{content.prefix}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.contents.map((item) => (
                <Card key={item.key} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {getFileType(item.key)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(item.size)}
                        </span>
                      </div>
                      
                      <div className="text-sm font-medium truncate">
                        {item.key.split('/').pop()}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.lastModified).toLocaleDateString()}
                      </div>

                      {getFileType(item.key) === 'image' && (
                        <img
                          src={item.url}
                          alt={item.key}
                          className="w-full h-32 object-cover rounded"
                          loading="lazy"
                        />
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

