export interface StartRegistrationRequest {
  email: string
}

export interface StartRegistrationResponse {
  session_id: string
  email: string
  expires_at: string
  debug_email_code?: string
}

export interface VerifyRegistrationRequest {
  session_id: string
  code: string
}

export interface VerifyRegistrationResponse {
  session_id: string
  email: string
  email_verified: boolean
  phone: string
  phone_verified: boolean
  expires_at: string
}

export interface StartPhoneRegistrationRequest {
  session_id: string
  phone: string
}

export interface StartPhoneRegistrationResponse {
  session_id: string
  phone: string
  expires_at: string
  debug_phone_code?: string
}

export interface VerifyPhoneRequest {
  session_id: string
  code: string
}

export interface VerifyPhoneResponse {
  session_id: string
  email: string
  email_verified: boolean
  phone: string
  phone_verified: boolean
  expires_at: string
}

export interface CompleteRegistrationRequest {
  session_id: string
}

export interface CompleteRegistrationResponse {
  access_token: string
  token_type: 'bearer'
}

export interface StartLoginRequest {
  email?: string
  phone?: string
}

export interface StartLoginResponse {
  session_id: string
  email: string
  phone: string
  expires_at: string
  debug_email_code?: string
  debug_phone_code?: string
}

export interface LoginRequest {
  session_id: string
  code: string
}

export interface LoginResponse {
  access_token: string
  token_type: 'bearer'
}

export interface YandexStartResponse {
  auth_url: string
}

export interface YandexCallbackRequest {
  code: string
  state: string
}

export interface YandexCallbackResponse {
  access_token: string
  token_type: 'bearer'
}

export interface Tariff {
  id: number
  name: string
  token_limit: number
  is_default: boolean
}

export interface User {
  id: number
  email: string
  phone: string
  free_checks_left: number
  tokens_balance: number
  tariff: Tariff
  org_name: string | null
  org_inn: string | null
  org_kpp: string | null
  org_legal_address: string | null
  org_contact_email: string | null
  created_at: string
}

export interface UpdateUserRequest {
  org_name?: string
  org_inn?: string
  org_kpp?: string
  org_legal_address?: string
  org_contact_email?: string
}

export interface TariffsListResponse {
  items: Tariff[]
}

export interface CurrentTariffResponse {
  tariff: Tariff
  tokens_balance: number
}

export type PaymentStatus = 'pending' | 'completed' | 'failed'

export interface Payment {
  id: number
  tokens_amount: number
  status: PaymentStatus
  description: string | null
  external_id: string | null
  created_at: string
  updated_at: string
}

export interface PaymentsListResponse {
  items: Payment[]
}

export interface CreatePaymentRequest {
  tokens_amount: number
  description?: string
  external_id?: string
}

export interface TokenTransaction {
  id: number
  delta: number
  reason: string
  analysis_id: number | null
  payment_id: number | null
  created_at: string
}

export interface TokenTransactionsResponse {
  items: TokenTransaction[]
}

export interface ContactPerson {
  lastName: string | null
  firstName: string | null
  middleName: string | null
}

export interface ResponsibleOrg {
  role: string | null
  fullName: string
  inn: string
  kpp: string
  factAddress: string | null
  contactPerson: ContactPerson | null
  contactEmail: string | null
  contactPhone: string | null
}

export interface ProcedureInfo {
  start: string | null
  end: string | null
  secondPartsDate: string | null
  summarizingDate: string | null
  deliveryTermStart: string | null
  deliveryTermEnd: string | null
}

export interface PurchaseObject {
  number: number
  name: string
  OKPD2: string
  OKPD2Name: string
  KTRU: string | null
  OKEIName: string | null
  quantity: number | null
  price: number | null
  sum: number | null
}

export interface DeliveryPlace {
  countryName: string | null
  deliveryPlace: string | null
  GARAddress: string | null
}

export interface Enforcement {
  applicationGuaranteeAmount: number | null
  applicationGuaranteePart: number | null
  contractGuaranteeAmount: number | null
  contractGuaranteePart: number | null
  contractProvisionWarrantyAmount: number | null
  contractProvisionWarrantyPart: number | null
}

export interface Customer {
  fullName: string
  inn: string
  kpp: string
  ogrn: string | null
  factualAddress: string | null
  postalAddress: string | null
  contactPerson: ContactPerson | null
  email: string | null
  phone: string | null
  fax: string | null
  ikz: string | null
  tenderPlanPositionNumber: string | null
  customerMaxPrice: number | null
  advanceSumPercents: number | null
  selfFunds: boolean | null
  mustPublicDiscussion: boolean | null
  treasurySupportContractRequired: boolean | null
  deliveryTermStart: string | null
  deliveryTermEnd: string | null
  deliveryPlaces: DeliveryPlace[]
  enforcement: Enforcement
}

export interface AddRequirement {
  code: string
  name: string
  content: string | null
}

export interface Requirement {
  code: string
  name: string
  content: string | null
  addRequirements: AddRequirement[] | null
}

export interface Requirements {
  requirement: Requirement[]
}

export interface Preference {
  code: string
  name: string
  value: string | null
}

export interface Preferences {
  preferense: Preference[]
}

export interface Customers {
  customer: Customer[]
}

export interface PurchaseObjects {
  purchaseObject: PurchaseObject[]
  totalSum?: number | null
  quantityUndefined?: string
}

export interface Lots {
  lot: Lot[]
}

export interface Lot {
  lotNumber: number
  maxPrice: number | null
  currency: string | null
  purchaseObjectsTotalSum: number | null
  lotDrugPurchase: boolean | null
  lotSmp: boolean | null
  lotSubContractors: boolean | null
  purchaseObjects: PurchaseObjects
  customers: Customers
  requirements: Requirements
  preferenses: Preferences
}

export interface Attachment {
  fileName: string
  docDescription: string | null
  docDate: string | null
  fileSize: string | null
  docKindCode: string | null
  docKindName?: string | null
  url: string | null
}

export interface Attachments {
  attachment: Attachment[]
}

export interface DeadlineStatus {
  isExpired: boolean
  hoursAgo: number | null
  hoursLeft: number | null
  displayText: string
}

export interface ComputedData {
  documentsCount: number
  positionsCount: number
  deadlineStatus: DeadlineStatus
  hasAdditionalRequirements: boolean
  chronology: Record<string, unknown>[]
}

export interface ProcurementBody {
  purchaseNumber: string
  purchaseObjectInfo: string
  placingWay: string
  ETP: string
  stage: string
  region: string | null
  href: string
  cancelled: boolean
  fullNMCK: number | null
  docPublishDate: string | null
  firstPublishDate: string | null
  procedureInfo: ProcedureInfo
  responsibleOrg: ResponsibleOrg
  lots: Lots
  attachments: Attachments
  computed: ComputedData
}

export type AnalysisType = 'fast' | 'full'

export interface DispatchProcurementRequest {
  purchase_id: string
  analysis_type: AnalysisType
}

export type DispatchStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface DispatchProcurementResponse {
  status: DispatchStatus
  purchase_id: string
  task_id: string
  analysis_id: number
  analysis_type: AnalysisType
}

export type AnalysisStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface StatusCallback {
  status: string
  details: string | null
}

export interface StatusResponse {
  purchase_id: string
  task_id: string
  state: string
  analysis_id: number
  analysis_status: AnalysisStatus
  analysis_type: AnalysisType
  tokens_spent: number
  result: string | null
  error: string | null
  callback: StatusCallback | null
}

export type RuleStatus = 'ok' | 'triggered'
export type RiskType = 'violation' | 'risk' | 'info' | 'inconsistency'
export type Severity = 'high' | 'medium' | 'low'

export interface RuleResult {
  rule_id: string
  title: string
  message: string
  status: RuleStatus
  risk_type: RiskType
  severity: Severity
  law_refs: string[]
  description: string
}

export interface RuleResults {
  applicable_rules: RuleResult[]
}

export interface AnalysisResult {
  procurement_id: string
  analysis_type: string
  procurement_hash: string
  rule_results: RuleResults
  parsed_docs_data: Record<string, unknown>
  provider_parsed_discrepancies: Record<string, unknown>
  llm?: string
}

export interface TaskResultResponse {
  task_id: string
  state: string
  analysis_id: number
  analysis_status: AnalysisStatus
  analysis_type: AnalysisType
  tokens_spent: number
  result: AnalysisResult | null
  error: string | null
}

export interface TaskAnalysisResponse {
  task_id: string
  state: string
  analysis_id: number
  analysis_status: AnalysisStatus
  analysis_type: AnalysisType
  tokens_spent: number
  result: AnalysisResult | null
  error: string | null
}

export interface AnalysisListItem {
  id: number
  purchase_id: string
  task_id: string
  status: AnalysisStatus
  analysis_type: AnalysisType
  tokens_spent: number
  created_at: string
  completed_at: string | null
  is_favorite: boolean
  title?: string
  nmck?: number
  deadline?: string
}

export interface AnalysesListResponse {
  items: AnalysisListItem[]
}

export interface FavoriteResponse {
  analysis_id: number
  created_at: string
}

export interface AddFavoriteRequest {
  analysis_id: number
}

export interface ApiError {
  detail: string | Array<{ loc: Array<string | number>; msg: string; type: string }>
}
