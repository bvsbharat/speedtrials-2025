export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPopulation = (pop: number): string => {
  if (pop >= 1000000) {
    return `${(pop / 1000000).toFixed(1)}M`;
  } else if (pop >= 1000) {
    return `${(pop / 1000).toFixed(0)}K`;
  }
  return pop.toString();
};

export const getSystemTypeLabel = (type: string): string => {
  switch (type) {
    case 'CWS':
      return 'Community Water System';
    case 'TNCWS':
      return 'Transient Non-Community';
    case 'NTNCWS':
      return 'Non-Transient Non-Community';
    default:
      return type;
  }
};

export const getOwnerTypeLabel = (type: string): string => {
  switch (type) {
    case 'F':
      return 'Federal';
    case 'L':
      return 'Local Government';
    case 'M':
      return 'Public/Private';
    case 'N':
      return 'Native American';
    case 'P':
      return 'Private';
    case 'S':
      return 'State Government';
    default:
      return type;
  }
};

export const getSourceTypeLabel = (type: string): string => {
  switch (type) {
    case 'GW':
      return 'Ground Water';
    case 'SW':
      return 'Surface Water';
    case 'GU':
      return 'Ground Water Under Influence';
    default:
      return type;
  }
};

export const getComplianceStatusColor = (status: string): string => {
  switch (status) {
    case 'compliant':
      return 'text-green-700 bg-green-100';
    case 'violation':
      return 'text-amber-700 bg-amber-100';
    case 'critical':
      return 'text-red-700 bg-red-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

export const getViolationStatusColor = (status: string): string => {
  switch (status) {
    case 'Resolved':
      return 'text-green-700 bg-green-100';
    case 'Addressed':
      return 'text-blue-700 bg-blue-100';
    case 'Unaddressed':
      return 'text-red-700 bg-red-100';
    case 'Archived':
      return 'text-gray-700 bg-gray-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};