function chkPass(pwd) {

    var Score ={
        total : 0
    ,   bonusLength : 0
    ,   bonusAlphaUC : 0
    ,   bonusAlphaLC : 0
    ,   bonusNumber : 0
    ,   bonusSymbol : 0
    ,   bonusMidChar : 0

    ,   malusAlphasOnly : 0
    ,   malusNumbersOnly : 0
    ,   malusRepChar : 0
    ,   malusConsecAlphaUC : 0
    ,   malusConsecAlphaLC : 0
    ,   malusConsecNumber : 0
    ,   malusSeqAlpha : 0
    ,   malusSeqNumber : 0
    ,   malusSeqSymbol : 0
    };

    var options = {
        minPwdLen : 8
    ,   alphas : "abcdefghijklmnopqrstuvwxyz"
    ,   numerics : "01234567890"
    ,   symbols : ")!@#$%^&*()"
    };

    var nLength=0, nAlphaUC=0, nAlphaLC=0, nNumber=0, nSymbol=0, nMidChar=0, nRequirements=0, nUnqChar=0, nRepChar=0, nRepInc=0, nConsecAlphaUC=0, nConsecAlphaLC=0, nConsecNumber=0, nConsecSymbol=0, nConsecCharType=0, nSeqAlpha=0, nSeqNumber=0, nSeqSymbol=0, nSeqChar=0, nReqChar=0, nMultConsecCharType=0;
    var nMultRepChar=1, nMultConsecSymbol=1;
    var nMultMidChar=2, nMultRequirements=2, nMultConsecAlphaUC=2, nMultConsecAlphaLC=2, nMultConsecNumber=2;
    var nReqCharType=3, nMultAlphaUC=3, nMultAlphaLC=3, nMultSeqAlpha=3, nMultSeqNumber=3, nMultSeqSymbol=3;
    var nMultLength=4, nMultNumber=4;
    var nMultSymbol=6;
    var nTmpAlphaUC="", nTmpAlphaLC="", nTmpNumber="", nTmpSymbol="";

    var sRequirements="0";

    if (pwd) {
        Score.total = parseInt(pwd.length * nMultLength);
        nLength = pwd.length;
        var arrPwd = pwd.replace(/\s+/g,"").split(/\s*/);
        var arrPwdLen = arrPwd.length;

        /* Loop through password to check for Symbol, Numeric, Lowercase and Uppercase pattern matches */
        for (var a=0; a < arrPwdLen; a++) {
            if (arrPwd[a].match(/[A-Z]/g)) {
                if (nTmpAlphaUC !== "") { if ((nTmpAlphaUC + 1) == a) { nConsecAlphaUC++; nConsecCharType++; } }
                nTmpAlphaUC = a;
                nAlphaUC++;
            }
            else if (arrPwd[a].match(/[a-z]/g)) {
                if (nTmpAlphaLC !== "") { if ((nTmpAlphaLC + 1) == a) { nConsecAlphaLC++; nConsecCharType++; } }
                nTmpAlphaLC = a;
                nAlphaLC++;
            }
            else if (arrPwd[a].match(/[0-9]/g)) {
                if (a > 0 && a < (arrPwdLen - 1)) { nMidChar++; }
                if (nTmpNumber !== "") { if ((nTmpNumber + 1) == a) { nConsecNumber++; nConsecCharType++; } }
                nTmpNumber = a;
                nNumber++;
            }
            else if (arrPwd[a].match(/[^a-zA-Z0-9_]/g)) {
                if (a > 0 && a < (arrPwdLen - 1)) { nMidChar++; }
                if (nTmpSymbol !== "") { if ((nTmpSymbol + 1) == a) { nConsecSymbol++; nConsecCharType++; } }
                nTmpSymbol = a;
                nSymbol++;
            }
            /* Internal loop through password to check for repeat characters */
            var bCharExists = false;
            for (var b=0; b < arrPwdLen; b++) {
                if (arrPwd[a] == arrPwd[b] && a != b) { /* repeat character exists */
                    bCharExists = true;
                    /*
                    Calculate icrement deduction based on proximity to identical characters
                    Deduction is incremented each time a new match is discovered
                    Deduction amount is based on total password length divided by the
                    difference of distance between currently selected match
                    */
                    nRepInc += Math.abs(arrPwdLen/(b-a));
                }
            }
            if (bCharExists) {
                nRepChar++;
                nUnqChar = arrPwdLen-nRepChar;
                nRepInc = (nUnqChar) ? Math.ceil(nRepInc/nUnqChar) : Math.ceil(nRepInc);
            }
        }

        /* Check for sequential alpha string patterns (forward and reverse) */
        for (var s=0; s < 23; s++) {
            var sFwd = options.alphas.substring(s,parseInt(s+3));
            var sRev = sFwd.strReverse();
            if (pwd.toLowerCase().indexOf(sFwd) != -1 || pwd.toLowerCase().indexOf(sRev) != -1) { nSeqAlpha++; nSeqChar++;}
        }

        /* Check for sequential numeric string patterns (forward and reverse) */
        for (var s=0; s < 8; s++) {
            var sFwd = options.numerics.substring(s,parseInt(s+3));
            var sRev = sFwd.strReverse();
            if (pwd.toLowerCase().indexOf(sFwd) != -1 || pwd.toLowerCase().indexOf(sRev) != -1) { nSeqNumber++; nSeqChar++;}
        }

        /* Check for sequential symbol string patterns (forward and reverse) */
        for (var s=0; s < 8; s++) {
            var sFwd = options.symbols.substring(s,parseInt(s+3));
            var sRev = sFwd.strReverse();
            if (pwd.toLowerCase().indexOf(sFwd) != -1 || pwd.toLowerCase().indexOf(sRev) != -1) { nSeqSymbol++; nSeqChar++;}
        }

    /* Modify overall score value based on usage vs requirements */

        /* General point assignment */
        Score.bonusLength = Score.total;
        if (nAlphaUC > 0 && nAlphaUC < nLength) {
            Score.bonusAlphaUC = parseInt((nLength - nAlphaUC) * 2);
            Score.total = parseInt(Score.total + Score.bonusAlphaUC );
        }
        if (nAlphaLC > 0 && nAlphaLC < nLength) {
            Score.bonusAlphaLC = parseInt((nLength - nAlphaLC) * 2);
            Score.total = parseInt(Score.total + Score.bonusAlphaLC );
        }
        if (nNumber > 0 && nNumber < nLength) {
            Score.bonusNumber = parseInt(nNumber * nMultNumber);
            Score.total = parseInt(Score.total + Score.bonusNumber);
        }
        if (nSymbol > 0) {
            Score.bonusSymbol = parseInt(nSymbol * nMultSymbol);
            Score.total = parseInt(Score.total + Score.bonusSymbol);
        }
        if (nMidChar > 0) {
            Score.bonusMidChar = parseInt(nMidChar * nMultMidChar);
            Score.total = parseInt(Score.total + Score.bonusMidChar);
        }

        /* Point deductions for poor practices */
        if ((nAlphaLC > 0 || nAlphaUC > 0) && nSymbol === 0 && nNumber === 0) {  // Only Letters
            Score.malusAlphasOnly = nLength;
            Score.total = parseInt(Score.total - nLength);
        }
        if (nAlphaLC === 0 && nAlphaUC === 0 && nSymbol === 0 && nNumber > 0) {  // Only Numbers
            Score.malusNumbersOnly = nLength;
            Score.total = parseInt(Score.total - nLength);
        }
        if (nRepChar > 0) {  // Same character exists more than once
            Score.malusRepChar = nRepInc;
            Score.total = parseInt(Score.total - nRepInc);
        }
        if (nConsecAlphaUC > 0) {  // Consecutive Uppercase Letters exist
            Score.malusConsecAlphaUC = parseInt(nConsecAlphaUC * nMultConsecAlphaUC);
            Score.total = parseInt(Score.total - Score.malusConsecAlphaUC);
        }
        if (nConsecAlphaLC > 0) {  // Consecutive Lowercase Letters exist
            Score.malusConsecAlphaLC = parseInt(nConsecAlphaLC * nMultConsecAlphaLC);
            Score.total = parseInt(Score.total - Score.malusConsecAlphaLC);
        }
        if (nConsecNumber > 0) {  // Consecutive Numbers exist
            Score.malusConsecNumber = parseInt(nConsecNumber * nMultConsecNumber);
            Score.total = parseInt(Score.total - Score.malusConsecNumber);
        }
        if (nSeqAlpha > 0) {  // Sequential alpha strings exist (3 characters or more)
            Score.malusSeqAlpha = parseInt(nSeqAlpha * nMultSeqAlpha);
            Score.total = parseInt(Score.total - Score.malusSeqAlpha);
        }
        if (nSeqNumber > 0) {  // Sequential numeric strings exist (3 characters or more)
            Score.malusSeqNumber = parseInt(nSeqNumber * nMultSeqNumber);
            Score.total = parseInt(Score.total - Score.malusSeqNumber);
        }
        if (nSeqSymbol > 0) {  // Sequential symbol strings exist (3 characters or more)
            Score.malusSeqSymbol = parseInt(nSeqSymbol * nMultSeqSymbol);
            Score.total = parseInt(Score.total - Score.malusSeqSymbol);
        }

        /* Determine if mandatory requirements have been met and set image indicators accordingly */
        var arrChars = [nLength,nAlphaUC,nAlphaLC,nNumber,nSymbol];
        var arrCharsIds = ["nLength","nAlphaUC","nAlphaLC","nNumber","nSymbol"];
        var arrCharsLen = arrChars.length;
        for (var c=0; c < arrCharsLen; c++) {
            if (arrCharsIds[c] == "nLength") { var minVal = parseInt(options.minPwdLen - 1); } else { var minVal = 0; }
            if (arrChars[c] == parseInt(minVal + 1)) {
                nReqChar++;
            }else if (arrChars[c] > parseInt(minVal + 1)) {
                nReqChar++;
            }
        }
        nRequirements = nReqChar;
        if (pwd.length >= options.minPwdLen) { var nMinReqChars = 3; } else { var nMinReqChars = 4; }
        if (nRequirements > nMinReqChars) {  // One or more required characters exist
            Score.total = parseInt(Score.total + (nRequirements * 2));
            sRequirements = "+ " + parseInt(nRequirements * 2);
        }

        return Score;
    }

}

