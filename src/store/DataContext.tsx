import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { DetailRow, DrilldownParams, SummaryMatrix, ToyType } from '../types';
import { loadInventoryData } from '../api/loadData';

interface DataContextValue {
  summaryMatrix: SummaryMatrix | null;
  detailRows: DetailRow[];
  hubs: string[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isCachedFallback: boolean;
  dataTimestamp: string;
  refetch: () => Promise<void>;

  // Global filters
  selectedHub: string;
  setSelectedHub: (hub: string) => void;
  selectedToyType: ToyType;
  setSelectedToyType: (type: ToyType) => void;

  // Drilldown modal state
  modalDrilldown: DrilldownParams | null;
  openDrilldownModal: (params: DrilldownParams) => void;
  closeDrilldownModal: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [summaryMatrix, setSummaryMatrix] = useState<SummaryMatrix | null>(null);
  const [detailRows, setDetailRows] = useState<DetailRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCachedFallback, setIsCachedFallback] = useState<boolean>(false);
  const [dataTimestamp, setDataTimestamp] = useState<string>('');

  // Global Filters
  const [selectedHub, setSelectedHub] = useState<string>('All');
  const [selectedToyType, setSelectedToyType] = useState<ToyType>('All');

  // Modal drilldown state
  const [modalDrilldown, setModalDrilldown] = useState<DrilldownParams | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);
    try {
      const data = await loadInventoryData();
      setSummaryMatrix(data.summaryMatrix);
      setDetailRows(data.detailRows);
      setIsCachedFallback(data.isCachedFallback);
      setDataTimestamp(data.dataTimestamp);
    } catch (err: any) {
      console.error('Failed to load inventory data:', err);
      setIsError(true);
      setErrorMessage(err.message || 'Failed to fetch inventory datasets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hubs = useMemo(() => {
    return summaryMatrix ? summaryMatrix.hubs : [];
  }, [summaryMatrix]);

  const openDrilldownModal = (params: DrilldownParams) => {
    setModalDrilldown(params);
  };

  const closeDrilldownModal = () => {
    setModalDrilldown(null);
  };

  const value = {
    summaryMatrix,
    detailRows,
    hubs,
    isLoading,
    isError,
    errorMessage,
    isCachedFallback,
    dataTimestamp,
    refetch: fetchData,
    selectedHub,
    setSelectedHub,
    selectedToyType,
    setSelectedToyType,
    modalDrilldown,
    openDrilldownModal,
    closeDrilldownModal,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
