/** @module a-base/front/mixins */

import actionBase from './common/actionBase.js';
import atomClasses from './common/atomClasses.js';
import atomActions from './common/atomActions.js';
import detailActions from './common/detailActions.js';
import modules from './common/modules.js';
import renderTableCellFormat from './common/renderTableCellFormat.js';

/** The mixins of a-base
 * @property {module:a-base/front/mixins/ebActionBase} ebActionBase - This provides the basic members used for action handler
 * @property {module:a-base/front/mixins/ebAtomClasses} ebAtomClasses - This provide the members of atomClasses
 * @property {object} ebAtomActions - This provide the members of atomActions
 * @property {object} ebDetailActions - This provide the members of detailActions
 * @property {object} ebModules - This provide the members of modules
 * @property {object} ebRenderTableCellFormat - This provide the general logics of renderTableCellFormat
 */
export default {
  ebActionBase: actionBase,
  ebAtomClasses: atomClasses,
  ebAtomActions: atomActions,
  ebDetailActions: detailActions,
  ebModules: modules,
  ebRenderTableCellFormat: renderTableCellFormat,
};
