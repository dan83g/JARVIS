import { full_url } from "../general/http";

export const Query = {
    get_query_url(query_id : string): string{
        return full_url(`/search/query/${query_id}`);
    },
} as const;