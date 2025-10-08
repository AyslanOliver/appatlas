import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFunction();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = () => {
        fetchData();
    };

    return { data, loading, error, refetch };
};

export const useAsyncAction = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (asyncFunction) => {
        try {
            setLoading(true);
            setError(null);
            const result = await asyncFunction();
            return result;
        } catch (err) {
            setError(err.message || 'Erro na operação');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { execute, loading, error };
};