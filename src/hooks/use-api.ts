import { apiClient } from '@/lib/api'
import type {
  AddFavoriteRequest,
  AnalysisStatus,
  CompleteRegistrationRequest,
  CreatePaymentRequest,
  DispatchProcurementRequest,
  LoginRequest,
  StartLoginRequest,
  StartPhoneRegistrationRequest,
  StartRegistrationRequest,
  UpdateUserRequest,
  VerifyPhoneRequest,
  VerifyRegistrationRequest
} from '@/types/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useStartRegistration() {
  return useMutation({ mutationFn: (data: StartRegistrationRequest) => apiClient.startRegistration(data) })
}

export function useVerifyRegistration() {
  return useMutation({ mutationFn: (data: VerifyRegistrationRequest) => apiClient.verifyRegistration(data) })
}

export function useStartPhoneRegistration() {
  return useMutation({ mutationFn: (data: StartPhoneRegistrationRequest) => apiClient.startPhoneRegistration(data) })
}

export function useVerifyPhone() {
  return useMutation({ mutationFn: (data: VerifyPhoneRequest) => apiClient.verifyPhone(data) })
}

export function useCompleteRegistration() {
  return useMutation({ mutationFn: (data: CompleteRegistrationRequest) => apiClient.completeRegistration(data) })
}

export function useStartLogin() {
  return useMutation({ mutationFn: (data: StartLoginRequest) => apiClient.startLogin(data) })
}

export function useLogin() {
  return useMutation({ mutationFn: (data: LoginRequest) => apiClient.login(data) })
}

export function useStartYandexAuth() {
  return useMutation({ mutationFn: (state?: string) => apiClient.startYandexAuth(state) })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateUserRequest) => apiClient.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })
}

export function useTariffs() {
  return useQuery({
    queryKey: ['tariffs'],
    queryFn: () => apiClient.listTariffs()
  })
}

export function useCurrentTariff() {
  return useQuery({
    queryKey: ['currentTariff'],
    queryFn: () => apiClient.getCurrentTariff()
  })
}

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: () => apiClient.listPayments()
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => apiClient.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })
}

export function useTokenTransactions(limit: number = 100) {
  return useQuery({
    queryKey: ['tokenTransactions', limit],
    queryFn: () => apiClient.listTokenTransactions(limit)
  })
}

export function useProcurementBody(purchaseId: string | null) {
  return useQuery({
    queryKey: ['procurementBody', purchaseId],
    queryFn: () => apiClient.getProcurementBody(purchaseId!),
    enabled: !!purchaseId
  })
}

export function useDispatchProcurement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DispatchProcurementRequest) => apiClient.dispatchProcurement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })
}

export function useTaskResult(taskId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['taskResult', taskId],
    queryFn: () => apiClient.getTaskResult(taskId!),
    enabled: !!taskId && enabled
  })
}

export function useTaskAnalysis(taskId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['taskAnalysis', taskId],
    queryFn: () => apiClient.getTaskAnalysis(taskId!),
    enabled: !!taskId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.analysis_status === 'completed' || data?.analysis_status === 'failed') {
        return false
      }
      return 3000
    }
  })
}

export function useAnalyses(statuses?: AnalysisStatus[]) {
  return useQuery({
    queryKey: ['analyses', statuses],
    queryFn: () => apiClient.listAnalyses(statuses)
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AddFavoriteRequest) => apiClient.addFavorite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
    }
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (analysisId: number) => apiClient.removeFavorite(analysisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
    }
  })
}
