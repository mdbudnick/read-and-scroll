// Readability. An Arc90 Lab Experiment.
// Website: http://lab.arc90.com/experiments/readability
// Source:  https://github.com/rdwallis/MagicScrollWebReader/blob/9ec084d04783236adcf55511d4af3729b5eb08b5/readability.js
//
// Copyright (c) 2009 Arc90 Inc
// Readability is licensed under the Apache License, Version 2.0.
//
// This file has been converted to TypeScript for use in the Read and Scroll extension.

interface ReadabilityScore {
  contentScore: number;
}
interface ReadabilityElement extends HTMLElement {
  readability?: ReadabilityScore;
}

export type Readability = {
  version: string;
  iframeLoads: number;
  frameHack: boolean;
  bodyCache: string | null;
  article: string | null;
  grandParent: boolean;
  regexps: {
    unlikelyCandidatesRe: RegExp;
    okMaybeItsACandidateRe: RegExp;
    positiveRe: RegExp;
    negativeRe: RegExp;
    divToPElementsRe: RegExp;
    replaceBrsRe: RegExp;
    replaceFontsRe: RegExp;
    trimRe: RegExp;
    normalizeRe: RegExp;
    killBreaksRe: RegExp;
    videoRe: RegExp;
    ignoreArticleTagRe: RegExp;
  };
  error?: boolean;
  init: (preserveUnlikelyCandidates?: boolean) => void;
  getArticleTitle: () => HTMLElement;
  prepDocument: () => void;
  prepArticle: (articleContent: HTMLElement) => void;
  initializeNode: (node: ReadabilityElement) => void;
  grabArticle: (preserveUnlikelyCandidates?: boolean) => HTMLElement;
  getInnerText: (e: HTMLElement, normalizeSpaces?: boolean) => string;
  getCharCount: (e: HTMLElement, s?: string) => number;
  cleanStyles: (e: HTMLElement) => void;
  getLinkDensity: (e: HTMLElement) => number;
  getClassWeight: (e: HTMLElement) => number;
  killBreaks: (e: HTMLElement) => void;
  clean: (e: HTMLElement, tag: string) => void;
  cleanConditionally: (e: HTMLElement, tag: string) => void;
  cleanHeaders: (e: HTMLElement) => void;
  removeFrame: () => void;
  htmlspecialchars: (s: string) => string;
};

const magicScroll: Readability = {
  version: "0.5.1",
  iframeLoads: 0,
  frameHack: false,
  bodyCache: null,
  article: null,
  grandParent: false,
  regexps: {
    unlikelyCandidatesRe:
      /combx|comment|disqus|foot|menu|nav|rss|shoutbox|sidebar|sponsor|popup|signup|share|cCol/i,
    okMaybeItsACandidateRe: /and|article|body|column|main|content|news|mod/i,
    positiveRe:
      /aCol|article|body|content|entry|hentry|page|pagination|post|text|story/i,
    negativeRe:
      /block|combx|comment|contact|foot|footer|footnote|link|media|meta|promo|related|scroll|shoutbox|sponsor|tags|widget|bio|alert|addInfo|slideshow|share|nocontent/i,
    divToPElementsRe: /<(a|blockquote|dl|div|img|ol|p|pre|table|ul)/i,
    replaceBrsRe: /(<br[^>]*>[ \n\r\t]*){2,}/gi,
    replaceFontsRe: /<(\/?)font[^>]*>/gi,
    trimRe: /^\s+|\s+$/g,
    normalizeRe: /\s{2,}/g,
    killBreaksRe: /(<br\s*\/?>(\s|&nbsp;?)*){1,}/g,
    videoRe: /http:\/\/(www\.)?(youtube|vimeo)\.com/i,
    ignoreArticleTagRe: /http:\/\/(www\.)?(economist)\.com\/blogs/i,
  },
  init: function (preserveUnlikelyCandidates?: boolean) {
    if (typeof window.stop != "undefined") {
      window.stop();
    }
    preserveUnlikelyCandidates =
      typeof preserveUnlikelyCandidates == "undefined"
        ? false
        : preserveUnlikelyCandidates;
    if (document.body && !magicScroll.bodyCache)
      magicScroll.bodyCache = document.body.innerHTML;
    magicScroll.prepDocument();
    // ss_load.show(); // Remove or replace as needed
    const articleTitle = magicScroll.getArticleTitle();
    const articleContent = magicScroll.grabArticle(preserveUnlikelyCandidates);
    if (magicScroll.getInnerText(articleContent, false) == "") {
      if (!preserveUnlikelyCandidates) {
        log("Discarding Unlikely Candidates", 2);
        document.body.innerHTML = magicScroll.bodyCache!;
        return magicScroll.init(true);
      } else {
        magicScroll.error = true;
        articleContent.innerHTML = "error";
      }
    } else {
      articleContent.insertBefore(articleTitle, articleContent.firstChild);
    }
    magicScroll.article = articleContent.innerHTML;
  },
  getArticleTitle: function () {
    const articleTitle = document.createElement("H1");
    articleTitle.innerHTML = document.title;
    return articleTitle;
  },
  prepDocument: function () {
    /**
     * In some cases a body element can't be found (if the HTML is totally hosed for example)
     * so we create a new body node and append it to the document.
     */
    if (document.body === null) {
      const body = document.createElement("body");
      try {
        document.body = body;
      } catch {
        document.documentElement.appendChild(body);
      }
    }

    const frames = document.getElementsByTagName("frame");
    if (frames.length > 0) {
      let bestFrame = null;
      let bestFrameSize = 0;
      for (let frameIndex = 0; frameIndex < frames.length; frameIndex++) {
        const frameSize =
          frames[frameIndex].offsetWidth + frames[frameIndex].offsetHeight;
        let canAccessFrame = false;
        const frame = frames[frameIndex] as HTMLFrameElement;
        if (
          frame.contentWindow &&
          frame.contentWindow.document &&
          frame.contentWindow.document.body
        ) {
          canAccessFrame = true;
        }

        if (canAccessFrame && frameSize > bestFrameSize) {
          bestFrame = frames[frameIndex];
          bestFrameSize = frameSize;
        }
      }

      if (bestFrame) {
        const newBody = document.createElement("body");
        // Add null checks for contentWindow and document.body
        if (
          bestFrame.contentWindow &&
          bestFrame.contentWindow.document &&
          bestFrame.contentWindow.document.body
        ) {
          newBody.innerHTML = bestFrame.contentWindow.document.body.innerHTML;
        } else {
          newBody.innerHTML = "";
        }
        newBody.style.overflow = "scroll";
        document.body = newBody;

        const frameset = document.getElementsByTagName("frameset")[0];
        if (frameset && frameset.parentNode)
          frameset.parentNode.removeChild(frameset);

        magicScroll.frameHack = true;
      }
    }

    /* resize all images */

    const images = document.getElementsByTagName("img");
    for (let i = images.length - 1; i >= 0; i--) {
      images[i].className = "ss_image";
    }

    /* remove all scripts that are not readability */
    const scripts = document.getElementsByTagName("script");
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (
        typeof scripts[i].src == "undefined" ||
        scripts[i].src.indexOf("staticScroll") == -1
      ) {
        scripts[i].parentNode?.removeChild(scripts[i]);
      }
    }

    const asides = document.getElementsByTagName("aside");
    for (let i = asides.length - 1; i >= 0; i--) {
      asides[i].parentNode?.removeChild(asides[i]);
    }

    /* remove all stylesheets */
    for (let k = 0; k < document.styleSheets.length; k++) {
      if (
        document.styleSheets[k].href != null &&
        document.styleSheets[k].href?.lastIndexOf("staticscroll") == -1
      ) {
        document.styleSheets[k].disabled = true;
      }
    }

    /* Remove all style tags in head (not doing this on IE) - TODO: Why not? */
    const styleTags = document.getElementsByTagName("style");
    for (let j = 0; j < styleTags.length; j++)
      if (navigator.appName != "Microsoft Internet Explorer")
        styleTags[j].textContent = "";

    const articles = document.getElementsByTagName("article");

    if (
      articles.length > 0 &&
      window.location.href.search(magicScroll.regexps.ignoreArticleTagRe) == -1
    ) {
      let result = "";
      for (let i = 0; i < articles.length; i++) {
        log("Article " + i + ": \n" + articles[i].innerHTML, -1);
        if (result.length < articles[i].innerHTML.length) {
          result = articles[i].innerHTML;
        }
      }
      document.body.innerHTML = result;
    } else {
      /* Turn all double br's into p's */
      /* Note, this is pretty costly as far as processing goes. Maybe optimize later. */
      document.body.innerHTML = document.body.innerHTML
        .replace(magicScroll.regexps.replaceBrsRe, "</p><p>")
        .replace(magicScroll.regexps.replaceFontsRe, "<$1span>");
    }
  },
  prepArticle: function (articleContent: HTMLElement) {
    magicScroll.cleanStyles(articleContent);
    magicScroll.killBreaks(articleContent);
    magicScroll.clean(articleContent, "form");
    magicScroll.clean(articleContent, "object");
    magicScroll.clean(articleContent, "h1");
    if (articleContent.getElementsByTagName("h2").length == 1)
      magicScroll.clean(articleContent, "h2");
    magicScroll.clean(articleContent, "iframe");
    magicScroll.cleanHeaders(articleContent);
    magicScroll.cleanConditionally(articleContent, "table");
    magicScroll.cleanConditionally(articleContent, "ul");
    magicScroll.cleanConditionally(articleContent, "div");
    const articleParagraphs = articleContent.getElementsByTagName("p");
    for (let i = articleParagraphs.length - 1; i >= 0; i--) {
      const imgCount = articleParagraphs[i].getElementsByTagName("img").length;
      const embedCount =
        articleParagraphs[i].getElementsByTagName("embed").length;
      const objectCount =
        articleParagraphs[i].getElementsByTagName("object").length;
      if (
        imgCount == 0 &&
        embedCount == 0 &&
        objectCount == 0 &&
        magicScroll.getInnerText(articleParagraphs[i], false) == ""
      ) {
        articleParagraphs[i].parentNode!.removeChild(articleParagraphs[i]);
      }
    }
    try {
      articleContent.innerHTML = articleContent.innerHTML.replace(
        /<br[^>]*>\s*<p/gi,
        "<p"
      );
    } catch {
      log(
        "Cleaning innerHTML of breaks failed. This is an IE strict-block-elements bug. Ignoring.",
        1
      );
    }
  },
  initializeNode: function (node: ReadabilityElement) {
    node.readability = { contentScore: 0 };
    switch (node.tagName) {
      case "NYT_TEXT":
        if (
          node.parentNode &&
          !(node.parentNode as ReadabilityElement).readability
        ) {
          (node.parentNode as ReadabilityElement).readability = {
            contentScore: 0,
          };
        }
        if (
          node.parentNode &&
          (node.parentNode as ReadabilityElement).readability
        ) {
          (
            node.parentNode as ReadabilityElement
          ).readability!.contentScore += 405;
        }
        break;
      case "DIV":
        node.readability.contentScore += 5;
        break;
      case "ARTICLE":
        node.readability.contentScore += 400;
        break;
      case "PRE":
      case "TD":
      case "BLOCKQUOTE":
        node.readability.contentScore += 3;
        break;
      case "ADDRESS":
      case "OL":
      case "UL":
      case "DL":
      case "DD":
      case "DT":
      case "LI":
      case "FORM":
        node.readability.contentScore -= 3;
        break;
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
      case "TH":
        node.readability.contentScore -= 5;
        break;
    }
    node.readability.contentScore += magicScroll.getClassWeight(node);
  },
  grabArticle: function (preserveUnlikelyCandidates?: boolean) {
    for (
      let nodeIndex = 0, node: ReadabilityElement;
      (node = document.getElementsByTagName("*")[
        nodeIndex
      ] as ReadabilityElement);
      nodeIndex++
    ) {
      if (!preserveUnlikelyCandidates) {
        const unlikelyMatchString = node.className + node.id;
        if (
          unlikelyMatchString.search(
            magicScroll.regexps.unlikelyCandidatesRe
          ) !== -1 &&
          unlikelyMatchString.search(
            magicScroll.regexps.okMaybeItsACandidateRe
          ) == -1 &&
          node.tagName !== "BODY"
        ) {
          if (node.parentNode) {
            (node.parentNode as HTMLElement).removeChild(node);
            nodeIndex--;
            continue;
          }
        }
      }
      if (node.tagName === "DIV") {
        if (
          node.innerHTML.search(magicScroll.regexps.divToPElementsRe) === -1
        ) {
          log("Altering div to p", 2);
          const newNode = document.createElement("p");
          try {
            newNode.innerHTML = node.innerHTML;
            if (node.parentNode) {
              node.parentNode.replaceChild(newNode, node);
              nodeIndex--;
            }
          } catch {
            // Ignore errors
          }
        } else {
          for (let i = 0, il = node.childNodes.length; i < il; i++) {
            const childNode = node.childNodes[i];
            if (childNode.nodeType == Node.TEXT_NODE) {
              log("replacing text node with a p tag with the same content.", 2);
              const p = document.createElement("p");
              p.innerHTML = childNode.nodeValue!;
              (p as HTMLElement).style.display = "inline";
              p.className = "readability-styled";
              if (childNode.parentNode) {
                childNode.parentNode.replaceChild(p, childNode);
              }
            }
          }
        }
      }
    }
    const allParagraphs = document.getElementsByTagName("p");
    const candidates: ReadabilityElement[] = [];
    for (let j = 0; j < allParagraphs.length; j++) {
      const parentNode = allParagraphs[j]
        .parentNode as ReadabilityElement | null;
      const grandParentNode =
        parentNode && (parentNode.parentNode as ReadabilityElement | null);
      const innerText = magicScroll.getInnerText(allParagraphs[j]);
      if (innerText.length < 25) continue;
      log("Considering paragraph " + j + ": " + innerText.substring(0, 20), 3);
      if (parentNode && typeof parentNode.readability === "undefined") {
        magicScroll.initializeNode(parentNode);
        candidates.push(parentNode);
      }
      if (
        grandParentNode &&
        typeof grandParentNode.readability === "undefined"
      ) {
        magicScroll.initializeNode(grandParentNode);
        candidates.push(grandParentNode);
      }
      let contentScore = 0;
      contentScore++;
      contentScore += innerText.split(",").length;
      contentScore += Math.min(Math.floor(innerText.length / 100), 3);
      if (parentNode && parentNode.readability)
        parentNode.readability.contentScore += contentScore;
      if (grandParentNode && grandParentNode.readability)
        grandParentNode.readability.contentScore += contentScore / 2;
      log("contentScore=" + contentScore, 2);
    }
    const topCandidates: ReadabilityElement[] = [];
    let topCandidate: ReadabilityElement | null = null;
    for (let i = 0, il = candidates.length; i < il; i++) {
      const candidate = candidates[i];
      if (candidate.readability) {
        candidate.readability.contentScore =
          candidate.readability.contentScore *
          (1 - magicScroll.getLinkDensity(candidate));
        log(
          "Candidate: " +
            candidate +
            " (" +
            candidate.className +
            ":" +
            candidate.id +
            ") with score " +
            candidate.readability.contentScore,
          2
        );
        const topScore =
          topCandidate && topCandidate.readability
            ? topCandidate.readability.contentScore
            : 0;
        if (!topCandidate || candidate.readability.contentScore > topScore) {
          topCandidate = candidate;
        }
        if (
          magicScroll.grandParent &&
          candidate.readability.contentScore > 50
        ) {
          topCandidates.push(candidate);
        }
      }
    }
    if (topCandidate == null || topCandidate.tagName == "BODY") {
      topCandidate = document.createElement("DIV") as ReadabilityElement;
      topCandidate.innerHTML = document.body.innerHTML;
      document.body.innerHTML = "";
      document.body.appendChild(topCandidate);
      magicScroll.initializeNode(topCandidate);
    }
    if (topCandidates.length === 0) {
      topCandidates.push(topCandidate);
    }
    const articleContent = document.createElement("DIV");
    articleContent.id = "readability-content";
    const siblingScoreThreshold = Math.max(
      10,
      (topCandidate.readability ? topCandidate.readability.contentScore : 0) *
        0.2
    );
    log("Top Candidates: " + topCandidates.length, 2);
    for (let k = 0; k < topCandidates.length; k++) {
      const siblingNodes = (topCandidates[k].parentNode as HTMLElement)
        .childNodes;
      for (let i = 0, il = siblingNodes.length; i < il; i++) {
        const siblingNode = siblingNodes[i] as ReadabilityElement;
        let append = false;
        log(
          "Looking at sibling node: " +
            siblingNode +
            " (" +
            siblingNode.className +
            ":" +
            siblingNode.id +
            ")" +
            (typeof siblingNode.readability != "undefined"
              ? " with score " + siblingNode.readability?.contentScore
              : ""),
          2
        );
        log(
          "Sibling has score " +
            (siblingNode.readability
              ? siblingNode.readability.contentScore
              : "Unknown"),
          2
        );
        if (siblingNode === topCandidates[k]) {
          append = true;
        }
        if (
          typeof siblingNode.readability != "undefined" &&
          siblingNode.readability &&
          siblingNode.readability.contentScore >= siblingScoreThreshold
        ) {
          append = true;
        }
        if (siblingNode.nodeName == "P") {
          const linkDensity = magicScroll.getLinkDensity(siblingNode);
          const nodeContent = magicScroll.getInnerText(siblingNode);
          const nodeLength = nodeContent.length;
          if (nodeLength > 80 && linkDensity < 0.25) {
            append = true;
          } else if (
            nodeLength < 80 &&
            linkDensity == 0 &&
            nodeContent.search(/\.( |$)/) !== -1
          ) {
            append = true;
          }
        }
        if (append) {
          log("Appending node: " + siblingNode, 2);
          articleContent.appendChild(siblingNode);
          i--;
          il--;
        }
      }
    }
    magicScroll.prepArticle(articleContent);
    return articleContent;
  },
  getInnerText: function (e: HTMLElement, normalizeSpaces?: boolean) {
    let textContent = "";
    normalizeSpaces =
      typeof normalizeSpaces == "undefined" ? true : normalizeSpaces;
    // Use modern IE detection
    const isIE = /MSIE|Trident/.test(window.navigator.userAgent);
    if (isIE && (e as unknown as { innerText?: string }).innerText) {
      textContent = (e as unknown as { innerText: string }).innerText.replace(
        magicScroll.regexps.trimRe,
        ""
      );
    } else {
      textContent =
        e.textContent?.replace(magicScroll.regexps.trimRe, "") || "";
    }
    if (normalizeSpaces)
      return textContent.replace(magicScroll.regexps.normalizeRe, " ");
    else return textContent;
  },
  getCharCount: function (e: HTMLElement, s?: string) {
    s = s || ",";
    return magicScroll.getInnerText(e).split(s).length;
  },
  cleanStyles: function (e: HTMLElement) {
    e = e || document.body;
    let cur = e.firstChild as HTMLElement | null;
    if (!e) return;
    if (
      typeof e.removeAttribute == "function" &&
      e.className != "readability-styled"
    )
      e.removeAttribute("style");
    while (cur != null) {
      if (cur.nodeType == 1) {
        if ((cur as HTMLElement).className != "readability-styled") {
          (cur as HTMLElement).removeAttribute("style");
        }
        magicScroll.cleanStyles(cur);
      }
      cur = cur.nextSibling as HTMLElement | null;
    }
  },
  getClassWeight: function (e: HTMLElement) {
    let weight = 0;
    if (e.className == "") {
      const prop = e.getAttribute("itemprop");
      if (prop) {
        e.className = prop;
      } else {
        const ident = e.getAttribute("id");
        if (ident) {
          e.className = ident;
        }
      }
    }
    if (e.className != "") {
      if (e.className.search(magicScroll.regexps.negativeRe) !== -1)
        weight -= 25;
      if (e.className.search(magicScroll.regexps.positiveRe) !== -1)
        weight += 25;
    }
    if (typeof e.id == "string" && e.id != "") {
      if (e.id.search(magicScroll.regexps.negativeRe) !== -1) weight -= 25;
      if (e.id.search(magicScroll.regexps.positiveRe) !== -1) weight += 25;
    }
    return weight;
  },
  getLinkDensity: function (e: HTMLElement) {
    const links = e.getElementsByTagName("a");
    const textLength = magicScroll.getInnerText(e).length;
    let linkLength = 0;
    for (let i = 0; i < links.length; i++) {
      linkLength += magicScroll.getInnerText(links[i] as HTMLElement).length;
    }
    if (textLength === 0) return 0;
    return linkLength / textLength;
  },
  killBreaks: function (e: HTMLElement) {
    try {
      e.innerHTML = e.innerHTML.replace(
        magicScroll.regexps.killBreaksRe,
        "<br />"
      );
    } catch {
      log("KillBreaks failed - this is an IE bug. Ignoring.", 1);
    }
  },
  clean: function (e: HTMLElement, tag: string) {
    const targetList = e.getElementsByTagName(tag);
    const isEmbed = tag == "object" || tag == "embed";
    for (let y = targetList.length - 1; y >= 0; y--) {
      if (
        isEmbed &&
        (targetList[y] as HTMLElement).innerHTML.search(
          magicScroll.regexps.videoRe
        ) !== -1
      ) {
        continue;
      }
      targetList[y].parentNode!.removeChild(targetList[y]);
    }
  },
  cleanConditionally: function (e: HTMLElement, tag: string) {
    const tagsList = e.getElementsByTagName(tag);
    const curTagsLength = tagsList.length;
    for (let i = curTagsLength - 1; i >= 0; i--) {
      const el = tagsList[i] as ReadabilityElement;
      const weight = magicScroll.getClassWeight(el);
      log(
        "Cleaning Conditionally " +
          el +
          " (" +
          el.className +
          ":" +
          el.id +
          ")" +
          (typeof el.readability != "undefined"
            ? " with score " + el.readability?.contentScore
            : ""),
        2
      );
      if (weight < 0) {
        el.parentNode!.removeChild(el);
      } else if (magicScroll.getCharCount(el, ",") < 10) {
        const p = el.getElementsByTagName("p").length;
        const img = el.getElementsByTagName("img").length;
        const li = el.getElementsByTagName("li").length - 100;
        const input = el.getElementsByTagName("input").length;
        let embedCount = 0;
        const embeds = el.getElementsByTagName("embed");
        for (let ei = 0, il = embeds.length; ei < il; ei++) {
          if (embeds[ei].src.search(magicScroll.regexps.videoRe) == -1) {
            embedCount++;
          }
        }
        const linkDensity = magicScroll.getLinkDensity(el);
        const contentLength = magicScroll.getInnerText(el).length;
        let toRemove = false;
        if (img > p) {
          toRemove = true;
        } else if (li > p && tag != "ul" && tag != "ol") {
          toRemove = true;
        } else if (input > Math.floor(p / 3)) {
          toRemove = true;
        } else if (contentLength < 25 && (img == 0 || img > 2)) {
          toRemove = true;
        } else if (weight < 25 && linkDensity > 0.2) {
          toRemove = true;
        } else if (weight >= 25 && linkDensity > 0.5) {
          toRemove = true;
        } else if ((embedCount == 1 && contentLength < 75) || embedCount > 1) {
          toRemove = true;
        }
        if (toRemove) {
          el.parentNode!.removeChild(el);
        }
      }
    }
  },
  cleanHeaders: function (e: HTMLElement) {
    for (let headerIndex = 1; headerIndex < 7; headerIndex++) {
      const headers = e.getElementsByTagName("h" + headerIndex);
      for (let i = headers.length - 1; i >= 0; i--) {
        const el = headers[i] as ReadabilityElement;
        if (
          magicScroll.getClassWeight(el) < 0 ||
          magicScroll.getLinkDensity(el) > 0.33
        ) {
          el.parentNode!.removeChild(el);
        }
      }
    }
  },
  removeFrame: function () {
    magicScroll.iframeLoads++;
    if (magicScroll.iframeLoads > 3) {
      const emailContainer = document.getElementById("email-container");
      if (null !== emailContainer) {
        emailContainer.parentNode!.removeChild(emailContainer);
      }
      const kindleContainer = document.getElementById("kindle-container");
      if (null !== kindleContainer) {
        kindleContainer.parentNode!.removeChild(kindleContainer);
      }
      magicScroll.iframeLoads = 0;
    }
  },
  htmlspecialchars: function (s: string) {
    if (typeof s == "string") {
      s = s.replace(/&/g, "&amp;");
      s = s.replace(/"/g, "&quot;");
      s = s.replace(/'/g, "&#039;");
      s = s.replace(/</g, "&lt;");
      s = s.replace(/>/g, "&gt;");
    }
    return s;
  },
};

function log(msg: string, level?: number) {
  if (typeof console !== "undefined" && console.log) {
    console.log(
      "[Readability]",
      msg,
      level !== undefined ? `(level ${level})` : ""
    );
  }
}

export default magicScroll;
