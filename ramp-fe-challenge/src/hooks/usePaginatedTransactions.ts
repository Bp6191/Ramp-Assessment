import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction, PaginatedTransactionsResult } from "../utils/types"
import { setTransactionApproval as mockSetTransactionApproval } from "../utils/requests"
// import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      if (response === null) return previousResponse // Bug 4: Replaced previous data because response was not merged; fixed by appending new data to existing list
      if (previousResponse === null) return response 
      

      return {
        data: [...previousResponse.data, ...response.data],
         nextPage: response.nextPage, }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  const setTransactionApproval = useCallback(
    ({ transactionId, newValue }: { transactionId: string; newValue: boolean }) => {
      // 🔁 Sync with mock data (simulate DB update)
      mockSetTransactionApproval({ transactionId, value: newValue })
  
      // ✅ Update frontend state so UI reflects change
      setPaginatedTransactions((prev) => {
        if (prev === null) return prev
  
        const updatedData = prev.data.map((tx) =>
          tx.id === transactionId ? { ...tx, approved: newValue } : tx
        )
  
        return { ...prev, data: updatedData }
      })
    },
    []
  )
  

  return { data: paginatedTransactions, loading, fetchAll, invalidateData, setTransactionApproval }

}


