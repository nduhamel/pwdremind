define(function () {
    var getLoginsJSON = function (loginsTable) {
        var nodes = [];
        var links = [];
        var loginsTable = loginsTable // HACK here!
        var passwordsDict = {};
        for (var password in loginsTable) {
            nodes.push({
                    name: password,
                    group: 0
            });
            var passwordIdx = nodes.length-1;
            passwordsDict[password] = passwordIdx;
            for (var site in loginsTable[password]) {
                nodes.push({
                    name: loginsTable[password][site], //.host, HACK here !
                    group: 1
                });
                links.push({
                    source: passwordIdx,
                    target: nodes.length-1,
                    value: 1
                });
            }
        }
        // Add warning edges between similar passwords
        var similarPasswordPairs = detectSimilarPasswords(loginsTable);
        for (var pairX in similarPasswordPairs) {
            var pair = similarPasswordPairs[pairX];
            nodes.push({
                name: 'These passwords are really similar!',
                group: 2
            });
            var warningNodeIdx = nodes.length-1;
            links.push({
                source: passwordsDict[pair[0]],
                target: warningNodeIdx,
                value: 2
            });
            links.push({
                source: passwordsDict[pair[1]],
                target: warningNodeIdx,
                value: 2
            });
        }
        return {
            nodes: nodes,
            links: links
        };
    };

    var detectSimilarPasswords = function (loginsTable) {
        var passwordsChecked = {};
        var similarPasswordPairs = [];

        for (var password1 in loginsTable) {
            for (var password2 in loginsTable) {
                if (password1 == password2)
                    continue;
                if (passwordsChecked[password2])
                    continue;

                if (passwordSimilarityCheck(password1,password2))
                    similarPasswordPairs.push([password1,password2]);
            }
            passwordsChecked[password1] = true;
        }
        return similarPasswordPairs;
    };

    var passwordSimilarityCheck = function (password1,password2) {
        return levenshtein(password1,password2) < Math.max(password1.length,password2.length)/2;
    };

    var levenshtein = function (str1, str2) {
        var l1 = str1.length, l2 = str2.length;
        if (Math.min(l1, l2) === 0) {
            return Math.max(l1, l2);
        }
        var i = 0, j = 0, d = [];
        for (i = 0 ; i <= l1 ; i++) {
            d[i] = [];
            d[i][0] = i;
        }
        for (j = 0 ; j <= l2 ; j++) {
            d[0][j] = j;
        }
        for (i = 1 ; i <= l1 ; i++) {
            for (j = 1 ; j <= l2 ; j++) {
                d[i][j] = Math.min(
                    d[i - 1][j] + 1,
                    d[i][j - 1] + 1,
                    d[i - 1][j - 1] + (str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1)
                );
            }
        }
        return d[l1][l2];
    };

    return getLoginsJSON;
});
