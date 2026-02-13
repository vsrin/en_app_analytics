// Format seconds to "Xm Ys" format
export const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0s';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    
    if (minutes === 0) {
      return `${secs}s`;
    }
    
    return `${minutes}m ${secs}s`;
  };

  
  
  // Format percentage
  export const formatPercent = (value: number): string => {
    if (!value || isNaN(value)) return '0%';
    return `${value.toFixed(1)}%`;
  };
  
  // Format large numbers
  export const formatNumber = (num: number): string => {
    if (!num || isNaN(num)) return '0';
    return num.toLocaleString();
  };
  
  // Format date
  export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format relative time
  export const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateStr);
  };