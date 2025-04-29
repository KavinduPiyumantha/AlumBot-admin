import createAxiosInstance from "@/utils/request";
import { CancelToken } from "axios";

const origin = window.location.origin;

const request = createAxiosInstance(import.meta.env.VITE_BASE_URL || origin);

export const adminLogin = (
  account_name: string,
  password: string
): Promise<API.BaseResopnse<{ token: string }>> =>
  request.post(`/alumBot_api/account/login`, {
    account_name,
    password,
  });

export const adminLogout = (account_name: string) =>
  request.post(`/alumBot_api/account/logout`, {
    account_name,
  });

export const changeAdminPassword = (params: API.ChangeAdminPwdParams) =>
  request.post(`/alumBot_api/account/update_password`, params);

export const getBotSettings = (): Promise<
  API.BaseResopnse<API.GetBotSettingsData>
> => request.post(`/alumBot_api/bot_config/get_bot_setting`);

export const updateBotSettings = (params: API.BotSettings) =>
  request.post(`/alumBot_api/bot_config/update_bot_setting`, params);

export const submitCrawlTask = (site: string) =>
  request.post(`/alumBot_api/sitemaps/submit_crawl_site`, {
    site,
    timestamp: Math.floor(Date.now() / 1000),
  });

export const getCrawlState = (
  site: string
): Promise<API.BaseResopnse<{ sites_info: API.CrawlSiteInfo[] }>> =>
  request.post(`/alumBot_api/sitemaps/get_crawl_site_info`, { site });

export const getCrawlStateWithList = (
  site?: string
): Promise<API.BaseResopnse<API.GetCrawlStateWithListData>> =>
  request.post(`/alumBot_api/sitemaps/get_crawl_url_list`, { site });

export const getCrawlSplitDetails = (
  id: number
): Promise<API.BaseResopnse<{ sub_content_list: API.CrawlSplitDetail[] }>> =>
  request.post(`/alumBot_api/sitemaps/get_url_sub_content_list`, { id });

export const importCrawlData = (id_list: number[]) =>
  request.post(`/alumBot_api/sitemaps/add_crawl_url_list`, { id_list });

export const deleteCrawlData = (id_list: number[]) =>
  request.post(`/alumBot_api/sitemaps/delete_crawl_url_list`, { id_list });

export const getConversationList = (
  params: API.GetConversationListParams
): Promise<API.BaseResopnse<{ conversation_list: API.Conversation[] }>> =>
  request.post(`/alumBot_api/queries/get_user_conversation_list`, params);

export const getChatLogs = (
  params: API.GetChatLogsParams,
  cancelToken?: CancelToken
): Promise<API.BaseResopnse<API.GetChatLogsData>> =>
  request.post(`/alumBot_api/queries/get_user_query_history_list`, params, {
    cancelToken,
  });

export const getInterveneRecords = (params: API.GetInterveneRecordsParams) =>
  request.post(`/alumBot_api/intervention/get_intervene_record`, params);

export const addInterveneRecord = (params: API.AddInterveneRecordParams) =>
  request.post(`/alumBot_api/intervention/add_intervene_record`, params);

export const updateInterveneRecord = (params: API.AddInterveneRecordParams) =>
  request.post(`/alumBot_api/intervention/update_intervene_record`, params);

export const batchDeleteInterveneRecord = (id_list: number[]) =>
  request.post(`/alumBot_api/intervention/batch_delete_intervene_record`, { id_list });

export const uploadPicture = (
  file: File
): Promise<API.BaseResopnse<{ picture_url: string }>> => {
  const formData = new FormData();
  formData.append("picture_file", file);
  return request.post(`/alumBot_api/common/upload_picture`, formData);
};

// New API function for uploading local files
export const submitLocalFileList = (
  formData: FormData
): Promise<API.BaseResopnse<API.SubmitLocalFileResponse>> => {
  return request.post(`/alumBot_api/files/submit_local_file_list`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Get local file list (useful for displaying already uploaded files)
export const getLocalFileList = (
  params: API.GetLocalFileListParams = {}
): Promise<API.BaseResopnse<API.GetLocalFileListResponse>> => {
  return request.post(`/alumBot_api/files/get_local_file_list`, params);
};

// Delete local files by their IDs
export const deleteLocalFileList = (
  id_list: number[]
): Promise<API.BaseResopnse<Record<string, never>>> => {
  return request.post(`/alumBot_api/files/delete_local_file_list`, { id_list });
};

// Isolated URLs API functions
export const submitIsolatedUrls = (
  urls: string[]
): Promise<API.BaseResopnse<API.SubmitIsolatedUrlsResponse>> => {
  return request.post(`/alumBot_api/urls/submit_isolated_url_list`, { url_list: urls });
};

export const getIsolatedUrlList = (
  params: API.GetIsolatedUrlListParams = {}
): Promise<API.BaseResopnse<API.GetIsolatedUrlListResponse>> => {
  return request.post(`/alumBot_api/urls/get_isolated_url_list`, params);
};

// Delete isolated URLs by their IDs
export const deleteIsolatedUrlList = (
  id_list: number[]
): Promise<API.BaseResopnse<Record<string, never>>> => {
  return request.post(`/alumBot_api/urls/delete_isolated_url_list`, { id_list });
};
