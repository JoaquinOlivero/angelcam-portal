export const getCookies = (cookieStr: string) =>
    cookieStr.split(";")
        .map((str: string) => str.trim().split(/=(.+)/))
        .reduce((acc: any, curr) => {
            acc[curr[0]] = curr[1];
            return acc;
        }, {})