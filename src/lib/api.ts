import type {
  AddFavoriteRequest,
  AnalysesListResponse,
  AnalysisStatus,
  ApiError,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  CreatePaymentRequest,
  CurrentTariffResponse,
  DispatchProcurementRequest,
  DispatchProcurementResponse,
  FavoriteResponse,
  LoginRequest,
  LoginResponse,
  Payment,
  PaymentsListResponse,
  ProcurementBody,
  StartLoginRequest,
  StartLoginResponse,
  StartPhoneRegistrationRequest,
  StartPhoneRegistrationResponse,
  StartRegistrationRequest,
  StartRegistrationResponse,
  TariffsListResponse,
  TaskAnalysisResponse,
  TaskResultResponse,
  TokenTransactionsResponse,
  UpdateUserRequest,
  User,
  VerifyPhoneRequest,
  VerifyPhoneResponse,
  VerifyRegistrationRequest,
  VerifyRegistrationResponse,
  YandexCallbackRequest,
  YandexCallbackResponse,
  YandexStartResponse
} from '@/types/api'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://194.87.86.58'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | undefined {
    return Cookies.get('access_token')
  }

  setToken(token: string) {
    Cookies.set('access_token', token, { expires: 7, sameSite: 'strict' })
  }

  removeToken() {
    Cookies.remove('access_token')
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ detail: 'Произошла ошибка' }))
      throw new Error(
        typeof error.detail === 'string'
          ? error.detail
          : error.detail?.[0]?.msg || 'Произошла ошибка'
      )
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  async startRegistration(data: StartRegistrationRequest): Promise<StartRegistrationResponse> {
    return this.request<StartRegistrationResponse>('/api/auth/register/start', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async verifyRegistration(data: VerifyRegistrationRequest): Promise<VerifyRegistrationResponse> {
    return this.request<VerifyRegistrationResponse>('/api/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async startPhoneRegistration(data: StartPhoneRegistrationRequest): Promise<StartPhoneRegistrationResponse> {
    return this.request<StartPhoneRegistrationResponse>('/api/auth/register/phone', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async verifyPhone(data: VerifyPhoneRequest): Promise<VerifyPhoneResponse> {
    return this.request<VerifyPhoneResponse>('/api/auth/register/verify-phone', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async completeRegistration(data: CompleteRegistrationRequest): Promise<CompleteRegistrationResponse> {
    return this.request<CompleteRegistrationResponse>('/api/auth/register/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async startLogin(data: StartLoginRequest): Promise<StartLoginResponse> {
    return this.request<StartLoginResponse>('/api/auth/login/start', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async startYandexAuth(state?: string): Promise<YandexStartResponse> {
    const params = state ? `?state=${encodeURIComponent(state)}` : ''
    return this.request<YandexStartResponse>(`/api/auth/yandex/start${params}`, { method: 'GET' })
  }

  async yandexCallback(data: YandexCallbackRequest): Promise<YandexCallbackResponse> {
    return this.request<YandexCallbackResponse>('/api/auth/yandex/callback', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me', { method: 'GET' })
  }

  async updateMe(data: UpdateUserRequest): Promise<User> {
    return this.request<User>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async listTariffs(): Promise<TariffsListResponse> {
    return this.request<TariffsListResponse>('/api/tariffs', { method: 'GET' })
  }

  async getCurrentTariff(): Promise<CurrentTariffResponse> {
    return this.request<CurrentTariffResponse>('/api/tariffs/current', { method: 'GET' })
  }

  async listPayments(): Promise<PaymentsListResponse> {
    return this.request<PaymentsListResponse>('/api/billing/payments', { method: 'GET' })
  }

  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    return this.request<Payment>('/api/billing/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async listTokenTransactions(limit: number = 100): Promise<TokenTransactionsResponse> {
    return this.request<TokenTransactionsResponse>(`/api/billing/transactions?limit=${limit}`, { method: 'GET' })
  }

  async getProcurementBody(purchaseId: string): Promise<ProcurementBody> {
    return this.request<ProcurementBody>(`/api/procurements/${encodeURIComponent(purchaseId)}/body`, { method: 'GET' })
  }

  async dispatchProcurement(data: DispatchProcurementRequest): Promise<DispatchProcurementResponse> {
    return this.request<DispatchProcurementResponse>('/api/procurements', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTaskResult(taskId: string): Promise<TaskResultResponse> {
    return this.request<TaskResultResponse>(`/api/result/${encodeURIComponent(taskId)}`, { method: 'GET' })
  }

  async getTaskAnalysis(taskId: string): Promise<TaskAnalysisResponse> {
    return this.request<TaskAnalysisResponse>(`/api/result/${encodeURIComponent(taskId)}/analysis`, { method: 'GET' })
  }

  async listAnalyses(statuses?: AnalysisStatus[]): Promise<AnalysesListResponse> {
    const params = statuses?.length ? `?statuses=${statuses.join('&statuses=')}` : ''
    return this.request<AnalysesListResponse>(`/api/analyses${params}`, { method: 'GET' })
  }

  async addFavorite(data: AddFavoriteRequest): Promise<FavoriteResponse> {
    return this.request<FavoriteResponse>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async removeFavorite(analysisId: number): Promise<void> {
    return this.request<void>(`/api/favorites/${analysisId}`, { method: 'DELETE' })
  }

  async downloadAnalysisSummaryPdf(taskId: string): Promise<Blob> {
    const url = `${this.baseUrl}/api/result/${encodeURIComponent(taskId)}/analysis/summary`
    const token = this.getToken()

    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, { method: 'GET', headers })

    if (!response.ok) {
      throw new Error('Не удалось скачать отчёт')
    }

    return response.blob()
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
