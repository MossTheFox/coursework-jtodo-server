/**
 * @file Node.js 可用的 QQ AuthTools
 * @author MossTheFox
 */
import axios from 'axios';

/** 获取 Authorization Code, 
 * ★★★★ 这个链接由服务端生成后直接发给用户进行 302 重定向
 * @param redirectUrl 需要进行 URLEncode，是用户授权登录后的回调地址，授权通过后会触发此 redirect 并携带上要拿到的 code 和 state 值 (这里是 userState)
 * @param userState 会原样传回，安全性验证。
 * @param display 用不到，留空吧
 */
export const getAuthCode = (redirectUrl = String(process.env.SITE_ROOT_DOMAIN), userState = "not_specified", display: string | null = null) => {
    return (`https://graph.qq.com/oauth2.0/authorize?`
        + `response_type=code&`
        + `client_id=${process.env.QAUTH_APPID}&`
        + `redirect_uri=${redirectUrl}&`
        + `state=${userState}&`
        + `scope=get_user_info&`
        + `${display ? "display=mobile" : ""}`);
}

/** 获取 Access Token，失败则抛出异常
 * @param authCode 之前获得的 Authorization Code
 * @param redirectUrl 和之前传的 Url 要一致，当然，也需要 URLEncode
*/
export const getAccessToken = async (authCode: string, redirectUrl: string) => {
    var res = await axios.get(`https://graph.qq.com/oauth2.0/token`, {
        params: {
            grant_type: "authorization_code",
            client_id: process.env.QAUTH_APPID,
            client_secret: process.env.QAUTH_APPKEY,
            code: authCode,
            redirect_uri: redirectUrl,
            fmt: "json"
        }
    });
    var json = res.data;
    if (json.code || json.msf || json.error || json.error_description) {
        // 出错
        throw new Error(JSON.stringify(json, null, 2));
    }

    // console.log(json);

    return {
        /** 授权令牌，Access_Token */
        accessToken: json.access_token,

        /** 该access token的有效期，单位为秒，默认有效期是 3 个月 */
        expiresIn: json.expires_in,

        /** 在授权自动续期步骤中，获取新的Access_Token时需要提供的参数，仅一次有效 */
        refreshToken: json.refresh_token,

        rawJSON: json
    }
}

/**
 * 续期 Access Token
 * @param refreshToken 之前获得的 refreshToken
 * @returns 续期后的 accessToken 等信息
 * @link https://wiki.connect.qq.com/%e4%bd%bf%e7%94%a8authorization_code%e8%8e%b7%e5%8f%96access_token
 */
export const refreshToken = async (refreshToken: string) => {
    let res = await axios.get(`https://graph.qq.com/oauth2.0/token`, {
        params: {
            grant_type: "refresh_token",
            client_id: process.env.QAUTH_APPID,
            client_secret: process.env.QAUTH_APPKEY,
            refresh_token: refreshToken,
            fmt: "json"
        }
    });
    let json = res.data;
    if (json.code || json.msf || json.error || json.error_description) {
        // 出错
        throw new Error(JSON.stringify(json, null, 2));
    }
    return {
        /** 授权令牌，Access_Token */
        accessToken: json.access_token + '',

        /** 该access token的有效期，单位为秒，默认有效期是 3 个月 */
        expiresIn: json.expires_in + '',

        /** 在授权自动续期步骤中，获取新的Access_Token时需要提供的参数，仅一次有效 */
        refreshToken: json.refresh_token + '',

        rawJSON: json
    };
}

/** 获取唯一标识符 OpenID 以及 UnionID, 出错则抛出异常
 * @param accessToken 之前拿到的 Access Token。有有效期，无效则抛出异常
 * @link https://wiki.connect.qq.com/%e8%8e%b7%e5%8f%96%e7%94%a8%e6%88%b7openid_oauth2-0
 */
export const getOpenID = async (accessToken: string) => {
    var res = await axios.get(`https://graph.qq.com/oauth2.0/me`, {
        params: {
            access_token: accessToken,
            unionid: 1,
            fmt: "json"
        }
    });

    var json = res.data;

    if (json.code || json.msf || json.error || json.error_description) {
        // 出错
        throw new Error("获取 OpebID 失败: " + JSON.stringify(json, null, 2));
    }

    // console.log(json);


    return ({
        /** AppID */
        clientID: json.client_id + '',

        /** 用户的唯一标识符 OpenID */
        openID: json.openid + '',

        /** 跨应用时，用 UnionID 作为唯一标识 */
        unionID: json.unionid + '',

        rawJSON: json
    });
}

/**
 * 获取用户信息，需要预先拿到 OpenID
 * @param {String} accessToken 就是 Access Token
 * @param {String} openID 是预先获取到的 OpenID
 * @link https://wiki.connect.qq.com/get_user_info
 */
export const getUserInfo = async (accessToken: string, openID: string) => {
    var res = await axios.get(`https://graph.qq.com/user/get_user_info`, {
        params: {
            access_token: accessToken,
            oauth_consumer_key: process.env.QAUTH_APPID,
            openid: openID
        }
    });
    var json = res.data;
    if (json?.ret !== 0) {
        console.log(json);
        throw new Error("获取用户信息出错。");
    }

    // console.log(json);

    let bigAvatarUrl = json.figureurl_qq_1;
    if ("figureurl_qq" in json) {
        bigAvatarUrl = json.figureurl_qq;   // 640x640
    } else if ("figureurl_2" in json) {
        bigAvatarUrl = json.figureurl_2;    // 100x100
    }

    return {
        /** 昵称 */
        nickname: json?.nickname ? json.nickname + '' : '',
        /** 可以获取的最大的 QQ 头像 URL */
        figureURL: bigAvatarUrl + '',
        /** 性别，默认男 */
        // gender: json?.gender,

        rawJSON: json
    };
}
