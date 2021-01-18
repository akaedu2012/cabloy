import pageContext from './common/pageContext.js';
import clipboard from './common/clipboard.js';
import validateCheck from './common/validate/validateCheck.js';
import viewSizeChange from './common/viewSizeChange.jsx';
import stats from './common/stats.js';

export default {
  ebPageContext: pageContext,
  ebClipboard: clipboard,
  ebValidateCheck: validateCheck,
  ebViewSizeChange: viewSizeChange,
  ebStats: stats,
};
