define(function(){

    var urlParseRE = /^(((([^:\/#\?]+:)?(?:\/\/((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?]+)(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;

    function parseUrl(url) {
        var u = url || "", matches = urlParseRE.exec(url), results;
        if (matches) {
            results = {
                href:         matches[0] || "",
                hrefNoHash:   matches[1] || "",
                hrefNoSearch: matches[2] || "",
                domain:       matches[3] || "",
                protocol:     matches[4] || "",
                authority:    matches[5] || "",
                username:     matches[7] || "",
                password:     matches[8] || "",
                host:         matches[9] || "",
                hostname:     matches[10] || "",
                port:         matches[11] || "",
                pathname:     matches[12] || "",
                directory:    matches[13] || "",
                filename:     matches[14] || "",
                search:       matches[15] || "",
                hash:         matches[16] || ""
            };
        }
        return results || {};
    };

    return parseUrl;
});
