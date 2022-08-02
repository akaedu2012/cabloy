module.exports = ctx => {
  class Procedure {
    selectAtoms({
      iid,
      userIdWho,
      tableName,
      where,
      orders,
      page,
      star,
      label,
      comment,
      file,
      count,
      stage,
      language,
      category,
      tag,
      mine,
      resource,
      resourceLocale,
      mode,
      cms,
      forAtomUser,
      role,
    }) {
      iid = parseInt(iid);
      userIdWho = parseInt(userIdWho);
      star = parseInt(star);
      label = parseInt(label);
      comment = parseInt(comment);
      file = parseInt(file);
      stage = parseInt(stage);
      category = parseInt(category);
      tag = parseInt(tag);
      mine = parseInt(mine);
      resource = parseInt(resource);
      role = parseInt(role);

      // draft
      if (stage === 0) {
        // userIdWho must be set
        return this._selectAtoms_draft({
          iid,
          userIdWho,
          tableName,
          where,
          orders,
          page,
          star,
          label,
          comment,
          file,
          count,
          stage,
          language,
          category,
          tag,
          mode,
          cms,
        });
      }
      if (userIdWho === 0) {
        return this._selectAtoms_0({
          iid,
          tableName,
          where,
          orders,
          page,
          comment,
          file,
          count,
          stage,
          language,
          category,
          tag,
          resource,
          resourceLocale,
          mode,
          cms,
          forAtomUser,
          role,
        });
      }
      // formal/history
      return this._selectAtoms({
        iid,
        userIdWho,
        tableName,
        where,
        orders,
        page,
        star,
        label,
        comment,
        file,
        count,
        stage,
        language,
        category,
        tag,
        mine,
        resource,
        resourceLocale,
        mode,
        cms,
        forAtomUser,
        role,
      });
    }

    _prepare_cms({ tableName, iid, mode, cms }) {
      let _cmsField, _cmsJoin, _cmsWhere;

      // cms
      if (cms) {
        _cmsField = `,${
          tableName ? '' : 'p.createdAt,p.updatedAt,'
        }p.sticky,p.keywords,p.description,p.summary,p.url,p.editMode,p.slug,p.sorting,p.flag,p.extra,p.imageCover,p.imageFirst,p.audioFirst,p.audioCoverFirst,p.uuid,p.renderAt`;
        _cmsJoin = ' inner join aCmsArticle p on p.atomId=a.id';
        _cmsWhere = ` and p.iid=${iid} and p.deleted=0`;
        if (mode && mode !== 'default') {
          // full/search/others
          _cmsField += ',q.content,q.html';
          _cmsJoin += ' inner join aCmsContent q on q.atomId=a.id';
          _cmsWhere += ` and q.iid=${iid} and q.deleted=0`;
        }
      } else {
        _cmsField = '';
        _cmsJoin = '';
        _cmsWhere = '';
      }

      return { _cmsField, _cmsJoin, _cmsWhere };
    }

    _selectAtoms_draft({
      iid,
      userIdWho,
      tableName,
      where,
      orders,
      page,
      star,
      label,
      comment,
      file,
      count,
      stage,
      language,
      category,
      tag,
      mode,
      cms,
    }) {
      // -- tables
      // -- a: aAtom
      // -- b: aAtomClass
      // -- c: aViewUserRightAtomClassRole
      // -- d: aAtomStar
      // -- e: aAtomLabelRef
      // -- f: {item}
      // -- g: aUser
      // -- g2: aUser
      // -- h: aComment
      // -- i: aFile
      // -- j: aCategory
      // -- k: aTagRef
      // -- p: aCmsArticle
      // -- q: aCmsContent
      // -- r: aFlow

      // for safe
      // tableName = tableName ? ctx.model.format('??', tableName) : null; // not format tableName
      where = where ? ctx.model._where(where) : null;
      orders = orders ? ctx.model._orders(orders) : null;
      const limit = page ? ctx.model._limit(page.size, page.index) : null;

      // vars
      let _languageWhere;
      let _categoryWhere;
      let _tagJoin, _tagWhere;

      let _starJoin, _starWhere;

      let _labelJoin, _labelWhere;
      let _commentField, _commentJoin, _commentWhere;

      let _fileField, _fileJoin, _fileWhere;

      let _itemField, _itemJoin;

      let _atomClassWhere;

      // cms
      const { _cmsField, _cmsJoin, _cmsWhere } = this._prepare_cms({ tableName, iid, mode, cms });

      //
      const _where = where ? `${where} AND` : ' WHERE';
      const _orders = orders || '';
      const _limit = limit || '';

      // language
      if (language) {
        _languageWhere = ctx.model.format(' and a.atomLanguage=?', language);
      } else {
        _languageWhere = '';
      }

      // category
      if (category) {
        _categoryWhere = ` and a.atomCategoryId=${category}`;
      } else {
        _categoryWhere = '';
      }

      // tag
      if (tag) {
        _tagJoin = ' inner join aTagRef k on k.atomId=a.id';
        _tagWhere = ` and k.iid=${iid} and k.tagId=${tag}`;
      } else {
        _tagJoin = '';
        _tagWhere = '';
      }

      // star
      if (star) {
        _starJoin = ' inner join aAtomStar d on a.id=d.atomId';
        _starWhere = ` and d.iid=${iid} and d.userId=${userIdWho} and d.star=1`;
      } else {
        _starJoin = '';
        _starWhere = '';
      }
      const _starField = `,(select d2.star from aAtomStar d2 where d2.iid=${iid} and d2.atomId=a.id and d2.userId=${userIdWho}) as star`;

      // label
      if (label) {
        _labelJoin = ' inner join aAtomLabelRef e on a.id=e.atomId';
        _labelWhere = ` and e.iid=${iid} and e.userId=${userIdWho} and e.labelId=${label}`;
      } else {
        _labelJoin = '';
        _labelWhere = '';
      }
      const _labelField = `,(select e2.labels from aAtomLabel e2 where e2.iid=${iid} and e2.atomId=a.id and e2.userId=${userIdWho}) as labels`;

      // comment
      if (comment) {
        _commentField = `,h.id h_id,h.createdAt h_createdAt,h.updatedAt h_updatedAt,h.userId h_userId,h.sorting h_sorting,h.heartCount h_heartCount,h.replyId h_replyId,h.replyUserId h_replyUserId,h.replyContent h_replyContent,h.content h_content,h.summary h_summary,h.html h_html,h.userName h_userName,h.avatar h_avatar,h.replyUserName h_replyUserName,
               (select h2.heart from aCommentHeart h2 where h2.iid=${iid} and h2.commentId=h.id and h2.userId=${userIdWho}) as h_heart`;

        _commentJoin = ' inner join aViewComment h on h.atomId=a.id';
        _commentWhere = ` and h.iid=${iid} and h.deleted=0`;
      } else {
        _commentField = '';
        _commentJoin = '';
        _commentWhere = '';
      }

      // file
      if (file) {
        _fileField =
          ',i.id i_id,i.createdAt i_createdAt,i.updatedAt i_updatedAt,i.userId i_userId,i.downloadId i_downloadId,i.mode i_mode,i.fileSize i_fileSize,i.width i_width,i.height i_height,i.filePath i_filePath,i.fileName i_fileName,i.realName i_realName,i.fileExt i_fileExt,i.encoding i_encoding,i.mime i_mime,i.attachment i_attachment,i.flag i_flag,i.userName i_userName,i.avatar i_avatar';
        _fileJoin = ' inner join aViewFile i on i.atomId=a.id';
        _fileWhere = ` and i.iid=${iid} and i.deleted=0`;
      } else {
        _fileField = '';
        _fileJoin = '';
        _fileWhere = '';
      }

      // flow
      const _flowField = ',r.flowStatus,r.flowNodeIdCurrent,r.flowNodeNameCurrent';
      const _flowJoin = ' left join aFlow r on r.id=a.atomFlowId';
      const _flowWhere = '';

      // tableName
      if (tableName) {
        _itemField = 'f.*,';
        _itemJoin = ` inner join ${tableName} f on f.atomId=a.id`;
      } else {
        _itemField = '';
        _itemJoin = '';
      }

      // atomClassInner
      // eslint-disable-next-line
      _atomClassWhere = '';
      // if (tableName || star || label) {
      //   _atomClassWhere = '';
      // } else {
      //   _atomClassWhere = ' and b.atomClassInner=0';
      // }

      // fields
      let _selectFields;
      if (count) {
        _selectFields = 'count(*) as _count';
      } else {
        _selectFields = `${_itemField}
                a.id as atomId,a.itemId,a.atomStage,a.atomFlowId,a.atomClosed,a.atomIdDraft,a.atomIdFormal,a.roleIdOwner,a.atomClassId,a.atomName,
                a.atomStatic,a.atomStaticKey,a.atomRevision,a.atomLanguage,a.atomCategoryId,j.categoryName as atomCategoryName,a.atomTags,a.atomSimple,a.atomDisabled,
                a.allowComment,a.starCount,a.commentCount,a.attachmentCount,a.readCount,a.userIdCreated,a.userIdUpdated,a.createdAt as atomCreatedAt,a.updatedAt as atomUpdatedAt,
                b.module,b.atomClassName,b.atomClassIdParent,
                g.userName,g.avatar,
                g2.userName as userNameUpdated,g2.avatar as avatarUpdated
                ${_starField} ${_labelField} ${_commentField}
                ${_fileField} ${_flowField}
                ${_cmsField}
              `;
      }

      // sql
      const _sql = `select ${_selectFields} from aAtom a
            inner join aAtomClass b on a.atomClassId=b.id
            left join aUser g on a.userIdCreated=g.id
            left join aUser g2 on a.userIdUpdated=g2.id
            left join aCategory j on a.atomCategoryId=j.id
            ${_itemJoin}
            ${_tagJoin}
            ${_starJoin}
            ${_labelJoin}
            ${_commentJoin}
            ${_fileJoin}
            ${_flowJoin}
            ${_cmsJoin}

          ${_where}
           (
             a.deleted=0 and a.iid=${iid} and a.atomStage=${stage} and a.atomClosed=0 and a.userIdUpdated=${userIdWho}
             ${_atomClassWhere}
             ${_languageWhere}
             ${_categoryWhere}
             ${_tagWhere}
             ${_starWhere}
             ${_labelWhere}
             ${_commentWhere}
             ${_fileWhere}
             ${_flowWhere}
             ${_cmsWhere}
           )

          ${count ? '' : _orders}
          ${count ? '' : _limit}
        `;

      // ok
      return _sql;
    }

    _selectAtoms_0({
      iid,
      tableName,
      where,
      orders,
      page,
      comment,
      file,
      count,
      stage,
      language,
      category,
      tag,
      resource,
      resourceLocale,
      mode,
      cms,
      forAtomUser,
      role,
    }) {
      // -- tables
      // -- a: aAtom
      // -- b: aAtomClass
      // -- c: aViewUserRightAtomClassRole
      // -- d: aAtomStar
      // -- e: aAtomLabelRef
      // -- f: {item}
      // -- g: aUser
      // -- g2: aUser
      // -- h: aComment
      // -- i: aFile
      // -- j: aCategory
      // -- k: aTagRef
      // -- m: aResourceLocale
      // -- p: aCmsArticle
      // -- q: aCmsContent

      // for safe
      // tableName = tableName ? ctx.model.format('??', tableName) : null; // not format tableName
      where = where ? ctx.model._where(where) : null;
      orders = orders ? ctx.model._orders(orders) : null;
      const limit = page ? ctx.model._limit(page.size, page.index) : null;

      // vars
      let _languageWhere;
      let _categoryWhere;
      let _tagJoin, _tagWhere;

      let _commentField, _commentJoin, _commentWhere;
      let _fileField, _fileJoin, _fileWhere;
      let _itemField, _itemJoin;

      let _atomClassWhere;

      let _resourceField, _resourceJoin, _resourceWhere;

      let _userField, _userJoin;

      // cms
      const { _cmsField, _cmsJoin, _cmsWhere } = this._prepare_cms({ tableName, iid, mode, cms });

      //
      const _where = where ? `${where} AND` : ' WHERE';
      const _orders = orders || '';
      const _limit = limit || '';

      // language
      if (language) {
        _languageWhere = ctx.model.format(' and a.atomLanguage=?', language);
      } else {
        _languageWhere = '';
      }

      // category
      if (category) {
        _categoryWhere = ` and a.atomCategoryId=${category}`;
      } else {
        _categoryWhere = '';
      }

      // tag
      if (tag) {
        _tagJoin = ' inner join aTagRef k on k.atomId=a.id';
        _tagWhere = ` and k.iid=${iid} and k.tagId=${tag}`;
      } else {
        _tagJoin = '';
        _tagWhere = '';
      }

      // comment
      if (comment) {
        _commentField =
          ',h.id h_id,h.createdAt h_createdAt,h.updatedAt h_updatedAt,h.userId h_userId,h.sorting h_sorting,h.heartCount h_heartCount,h.replyId h_replyId,h.replyUserId h_replyUserId,h.replyContent h_replyContent,h.content h_content,h.summary h_summary,h.html h_html,h.userName h_userName,h.avatar h_avatar,h.replyUserName h_replyUserName';
        _commentJoin = ' inner join aViewComment h on h.atomId=a.id';
        _commentWhere = ` and h.iid=${iid} and h.deleted=0`;
      } else {
        _commentField = '';
        _commentJoin = '';
        _commentWhere = '';
      }

      // file
      if (file) {
        _fileField =
          ',i.id i_id,i.createdAt i_createdAt,i.updatedAt i_updatedAt,i.userId i_userId,i.downloadId i_downloadId,i.mode i_mode,i.fileSize i_fileSize,i.width i_width,i.height i_height,i.filePath i_filePath,i.fileName i_fileName,i.realName i_realName,i.fileExt i_fileExt,i.encoding i_encoding,i.mime i_mime,i.attachment i_attachment,i.flag i_flag,i.userName i_userName,i.avatar i_avatar';
        _fileJoin = ' inner join aViewFile i on i.atomId=a.id';
        _fileWhere = ` and i.iid=${iid} and i.deleted=0`;
      } else {
        _fileField = '';
        _fileJoin = '';
        _fileWhere = '';
      }

      // resource
      if (resource && resourceLocale) {
        _resourceField = ',m.atomNameLocale';
        _resourceJoin = ' left join aResourceLocale m on m.atomId=a.id';
        _resourceWhere = ctx.model.format(' and a.atomDisabled=0 and m.locale=?', resourceLocale);
      } else {
        _resourceField = '';
        _resourceJoin = '';
        _resourceWhere = '';
      }

      // tableName
      if (tableName) {
        _itemField = 'f.*,';
        _itemJoin = ` inner join ${tableName} f on f.atomId=a.id`;
      } else {
        _itemField = '';
        _itemJoin = '';
      }

      // atomClassInner
      // atomClassInner
      if (tableName) {
        _atomClassWhere = '';
      } else {
        _atomClassWhere = ' and b.atomClassInner=0';
      }

      // aUser
      if (forAtomUser) {
        _userField = '';
        _userJoin = '';
      } else {
        _userField = 'g.userName,g.avatar,';
        _userJoin = ' left join aUser g on a.userIdCreated=g.id';
      }

      // fields
      let _selectFields;
      if (count) {
        _selectFields = 'count(*) as _count';
      } else {
        _selectFields = `${_itemField}
                a.id as atomId,a.itemId,a.atomStage,a.atomFlowId,a.atomClosed,a.atomIdDraft,a.atomIdFormal,a.roleIdOwner,a.atomClassId,a.atomName,
                a.atomStatic,a.atomStaticKey,a.atomRevision,a.atomLanguage,a.atomCategoryId,j.categoryName as atomCategoryName,a.atomTags,a.atomSimple,a.atomDisabled,
                a.allowComment,a.starCount,a.commentCount,a.attachmentCount,a.readCount,a.userIdCreated,a.userIdUpdated,a.createdAt as atomCreatedAt,a.updatedAt as atomUpdatedAt,
                b.module,b.atomClassName,b.atomClassIdParent,
                ${_userField}
                g2.userName as userNameUpdated,g2.avatar as avatarUpdated
                ${_commentField} ${_fileField} ${_resourceField} ${_cmsField}`;
      }

      // _rightWhere
      let _rightWhere;
      if (forAtomUser && role) {
        _rightWhere = `
        exists(
          select c2.userId from aViewUserRoleRef c2 where c2.iid=${iid} and a.itemId=c2.userId and c2.roleIdParent=${role}
        )
      `;
      }
      if (_rightWhere) {
        _rightWhere = ` and ( ${_rightWhere} )`;
      } else {
        _rightWhere = '';
      }

      // sql
      const _sql = `select ${_selectFields} from aAtom a
            inner join aAtomClass b on a.atomClassId=b.id
            ${_userJoin}
            left join aUser g2 on a.userIdUpdated=g2.id
            left join aCategory j on a.atomCategoryId=j.id
            ${_itemJoin}
            ${_tagJoin}
            ${_commentJoin}
            ${_fileJoin}
            ${_resourceJoin}
            ${_cmsJoin}

          ${_where}
           (
             a.deleted=0 and a.iid=${iid} and a.atomStage=${stage}
             ${_atomClassWhere}
             ${_languageWhere}
             ${_categoryWhere}
             ${_tagWhere}
             ${_commentWhere}
             ${_fileWhere}
             ${_resourceWhere}
             ${_cmsWhere}
             ${_rightWhere}
           )

          ${count ? '' : _orders}
          ${count ? '' : _limit}
        `;

      // ok
      return _sql;
    }

    _selectAtoms({
      iid,
      userIdWho,
      tableName,
      where,
      orders,
      page,
      star,
      label,
      comment,
      file,
      count,
      stage,
      language,
      category,
      tag,
      mine,
      resource,
      resourceLocale,
      mode,
      cms,
      forAtomUser,
      role,
    }) {
      // -- tables
      // -- a: aAtom
      // -- b: aAtomClass
      // -- c: aViewUserRightAtomClassRole
      // -- d: aAtomStar
      // -- e: aAtomLabelRef
      // -- f: {item}
      // -- g: aUser
      // -- g2: aUser
      // -- h: aComment
      // -- i: aFile
      // -- j: aCategory
      // -- k: aTagRef
      // -- m: aResourceLocale
      // -- p: aCmsArticle
      // -- q: aCmsContent

      // for safe
      // tableName = tableName ? ctx.model.format('??', tableName) : null; // not format tableName
      where = where ? ctx.model._where(where) : null;
      orders = orders ? ctx.model._orders(orders) : null;
      const limit = page ? ctx.model._limit(page.size, page.index) : null;

      // vars
      let _languageWhere;
      let _categoryWhere;
      let _tagJoin, _tagWhere;

      let _starJoin, _starWhere;

      let _labelJoin, _labelWhere;
      let _commentField, _commentJoin, _commentWhere;
      let _fileField, _fileJoin, _fileWhere;
      let _itemField, _itemJoin;
      let _itemKeyName;

      let _atomClassWhere;

      let _resourceField, _resourceJoin, _resourceWhere;

      let _userField, _userJoin;

      // cms
      const { _cmsField, _cmsJoin, _cmsWhere } = this._prepare_cms({ tableName, iid, mode, cms });

      //
      const _where = where ? `${where} AND` : ' WHERE';
      const _orders = orders || '';
      const _limit = limit || '';

      // language
      if (language) {
        _languageWhere = ctx.model.format(' and a.atomLanguage=?', language);
      } else {
        _languageWhere = '';
      }

      // category
      if (category) {
        _categoryWhere = ` and a.atomCategoryId=${category}`;
      } else {
        _categoryWhere = '';
      }

      // tag
      if (tag) {
        _tagJoin = ' inner join aTagRef k on k.atomId=a.id';
        _tagWhere = ` and k.iid=${iid} and k.tagId=${tag}`;
      } else {
        _tagJoin = '';
        _tagWhere = '';
      }

      // star
      if (star) {
        _starJoin = ' inner join aAtomStar d on a.id=d.atomId';
        _starWhere = ` and d.iid=${iid} and d.userId=${userIdWho} and d.star=1`;
      } else {
        _starJoin = '';
        _starWhere = '';
      }
      const _starField = `,(select d2.star from aAtomStar d2 where d2.iid=${iid} and d2.atomId=a.id and d2.userId=${userIdWho}) as star`;

      // label
      if (label) {
        _labelJoin = ' inner join aAtomLabelRef e on a.id=e.atomId';
        _labelWhere = ` and e.iid=${iid} and e.userId=${userIdWho} and e.labelId=${label}`;
      } else {
        _labelJoin = '';
        _labelWhere = '';
      }
      const _labelField = `,(select e2.labels from aAtomLabel e2 where e2.iid=${iid} and e2.atomId=a.id and e2.userId=${userIdWho}) as labels`;

      // comment
      if (comment) {
        _commentField = `,h.id h_id,h.createdAt h_createdAt,h.updatedAt h_updatedAt,h.userId h_userId,h.sorting h_sorting,h.heartCount h_heartCount,h.replyId h_replyId,h.replyUserId h_replyUserId,h.replyContent h_replyContent,h.content h_content,h.summary h_summary,h.html h_html,h.userName h_userName,h.avatar h_avatar,h.replyUserName h_replyUserName,
               (select h2.heart from aCommentHeart h2 where h2.iid=${iid} and h2.commentId=h.id and h2.userId=${userIdWho}) as h_heart`;

        _commentJoin = ' inner join aViewComment h on h.atomId=a.id';
        _commentWhere = ` and h.iid=${iid} and h.deleted=0`;
      } else {
        _commentField = '';
        _commentJoin = '';
        _commentWhere = '';
      }

      // file
      if (file) {
        _fileField =
          ',i.id i_id,i.createdAt i_createdAt,i.updatedAt i_updatedAt,i.userId i_userId,i.downloadId i_downloadId,i.mode i_mode,i.fileSize i_fileSize,i.width i_width,i.height i_height,i.filePath i_filePath,i.fileName i_fileName,i.realName i_realName,i.fileExt i_fileExt,i.encoding i_encoding,i.mime i_mime,i.attachment i_attachment,i.flag i_flag,i.userName i_userName,i.avatar i_avatar';
        _fileJoin = ' inner join aViewFile i on i.atomId=a.id';
        _fileWhere = ` and i.iid=${iid} and i.deleted=0`;
      } else {
        _fileField = '';
        _fileJoin = '';
        _fileWhere = '';
      }

      // resource
      if (resource && resourceLocale) {
        _resourceField = ',m.atomNameLocale';
        _resourceJoin = ' left join aResourceLocale m on m.atomId=a.id';
        _resourceWhere = ctx.model.format(' and a.atomDisabled=0 and m.locale=?', resourceLocale);
      } else {
        _resourceField = '';
        _resourceJoin = '';
        _resourceWhere = '';
      }

      // tableName
      if (tableName) {
        _itemField = 'f.*,';
        _itemJoin = ` inner join ${tableName} f on f.atomId=a.id`;
        _itemKeyName = 'f.atomId';
      } else {
        _itemField = '';
        _itemJoin = '';
        _itemKeyName = 'a.id';
      }

      // atomClassInner
      if (tableName || star || label) {
        _atomClassWhere = '';
      } else {
        _atomClassWhere = ' and b.atomClassInner=0';
      }

      // aUser
      if (forAtomUser) {
        _userField = '';
        _userJoin = '';
      } else {
        _userField = 'g.userName,g.avatar,';
        _userJoin = ' left join aUser g on a.userIdCreated=g.id';
      }

      // fields
      let _selectFields;
      if (count) {
        _selectFields = 'count(*) as _count';
      } else {
        _selectFields = `${_itemField}
                a.id as atomId,a.itemId,a.atomStage,a.atomFlowId,a.atomClosed,a.atomIdDraft,a.atomIdFormal,a.roleIdOwner,a.atomClassId,a.atomName,
                a.atomStatic,a.atomStaticKey,a.atomRevision,a.atomLanguage,a.atomCategoryId,j.categoryName as atomCategoryName,a.atomTags,a.atomSimple,a.atomDisabled,
                a.allowComment,a.starCount,a.commentCount,a.attachmentCount,a.readCount,a.userIdCreated,a.userIdUpdated,a.createdAt as atomCreatedAt,a.updatedAt as atomUpdatedAt,
                b.module,b.atomClassName,b.atomClassIdParent,
                ${_userField}
                g2.userName as userNameUpdated,g2.avatar as avatarUpdated
                ${_starField} ${_labelField} ${_commentField} ${_fileField} ${_resourceField} ${_cmsField}`;
      }

      // _rightWhere
      let _rightWhere;
      if (resource) {
        _rightWhere = `
          exists(
            select c.resourceAtomId from aViewUserRightResource c where c.iid=${iid} and ${_itemKeyName}=c.resourceAtomId and c.userIdWho=${userIdWho}
          )
        `;
      } else {
        const _mine = `
          (a.userIdCreated=${userIdWho} and exists(select c.atomClassId from aViewUserRightAtomClass c where c.iid=${iid} and a.atomClassId=c.atomClassId and c.action=2 and c.scope=0 and c.userIdWho=${userIdWho}))
        `;
        let _others;
        if (forAtomUser) {
          if (role) {
            _others = `
              exists(
                select c.userIdWhom from aViewUserRightAtomClassUser c
                  inner join aViewUserRoleRef c2 on c.userIdWhom=c2.userId and c2.roleIdParent=${role}
                  where c.iid=${iid} and a.itemId=c.userIdWhom and c.atomClassId=a.atomClassId and c.action=2 and c.userIdWho=${userIdWho}
              )
            `;
          } else {
            _others = `
              exists(
                select c.userIdWhom from aViewUserRightAtomClassUser c where c.iid=${iid} and a.itemId=c.userIdWhom and c.atomClassId=a.atomClassId and c.action=2 and c.userIdWho=${userIdWho}
              )
            `;
          }
        } else {
          _others = `
            exists(
              select c.roleIdWhom from aViewUserRightAtomClassRole c 
                where c.iid=${iid} and c.atomClassId=a.atomClassId and c.action=2 and c.roleIdWhom=a.roleIdOwner and c.userIdWho=${userIdWho}
            )
          `;
        }
        //
        if (mine) {
          _rightWhere = _mine;
        } else if (star || label) {
          _rightWhere = `
            (
              ${_mine}
              or
              ${_others}
            )
          `;
        } else {
          // _rightWhere = _others;
          _rightWhere = `
            (
              ${_mine}
              or
              ${_others}
            )
          `;
        }
      }
      if (_rightWhere) {
        _rightWhere = ` and ( ${_rightWhere} )`;
      } else {
        _rightWhere = '';
      }

      // sql
      const _sql = `select ${_selectFields} from aAtom a
            inner join aAtomClass b on a.atomClassId=b.id
            ${_userJoin}
            left join aUser g2 on a.userIdUpdated=g2.id
            left join aCategory j on a.atomCategoryId=j.id
            ${_itemJoin}
            ${_tagJoin}
            ${_starJoin}
            ${_labelJoin}
            ${_commentJoin}
            ${_fileJoin}
            ${_resourceJoin}
            ${_cmsJoin}

          ${_where}
           (
             a.deleted=0 and a.iid=${iid} and a.atomStage=${stage}
             ${_atomClassWhere}
             ${_languageWhere}
             ${_categoryWhere}
             ${_tagWhere}
             ${_starWhere}
             ${_labelWhere}
             ${_commentWhere}
             ${_fileWhere}
             ${_resourceWhere}
             ${_cmsWhere}
             ${_rightWhere}
           )

          ${count ? '' : _orders}
          ${count ? '' : _limit}
        `;

      // ok
      return _sql;
    }

    getAtom({ iid, userIdWho, tableName, atomId, resource, resourceLocale, mode, cms, forAtomUser }) {
      // -- tables
      // -- a: aAtom
      // -- b: aAtomClass
      // -- d: aAtomStar
      // -- e: aAtomLabelRef
      // -- f: {item}
      // -- g: aUser
      // -- g2: aUser
      // -- j: aCategory
      // -- m: aResourceLocale
      // -- p: aCmsArticle
      // -- q: aCmsContent
      // -- r: aFlow

      // for safe
      // tableName = tableName ? ctx.model.format('??', tableName) : null; // not format tableName

      iid = parseInt(iid);
      userIdWho = parseInt(userIdWho);
      atomId = parseInt(atomId);
      resource = parseInt(resource);

      // vars
      let _starField, _labelField;
      let _itemField, _itemJoin;

      let _resourceField, _resourceJoin, _resourceWhere;

      let _userField, _userJoin;

      // star
      if (userIdWho) {
        _starField = `,(select d.star from aAtomStar d where d.iid=${iid} and d.atomId=a.id and d.userId=${userIdWho}) as star`;
      } else {
        _starField = '';
      }

      // label
      if (userIdWho) {
        _labelField = `,(select e.labels from aAtomLabel e where e.iid=${iid} and e.atomId=a.id and e.userId=${userIdWho}) as labels`;
      } else {
        _labelField = '';
      }

      // resource
      if (resource && resourceLocale) {
        _resourceField = ',m.atomNameLocale';
        _resourceJoin = ' left join aResourceLocale m on m.atomId=a.id';
        // not check atomDisabled
        _resourceWhere = ctx.model.format(' and m.locale=?', resourceLocale);
      } else {
        _resourceField = '';
        _resourceJoin = '';
        _resourceWhere = '';
      }

      // flow
      const _flowField = ',r.flowStatus,r.flowNodeIdCurrent,r.flowNodeNameCurrent';
      const _flowJoin = ' left join aFlow r on r.id=a.atomFlowId';
      const _flowWhere = '';

      // tableName
      if (tableName) {
        _itemField = 'f.*,';
        _itemJoin = ` inner join ${tableName} f on f.atomId=a.id`;
      } else {
        _itemField = '';
        _itemJoin = '';
      }

      // cms
      const { _cmsField, _cmsJoin, _cmsWhere } = this._prepare_cms({ tableName, iid, mode, cms });

      // aUser
      if (forAtomUser) {
        _userField = '';
        _userJoin = '';
      } else {
        _userField = 'g.userName,g.avatar,';
        _userJoin = ' left join aUser g on a.userIdCreated=g.id';
      }

      // sql
      const _sql = `select ${_itemField}
                a.id as atomId,a.itemId,a.atomStage,a.atomFlowId,a.atomClosed,a.atomIdDraft,a.atomIdFormal,a.roleIdOwner,a.atomClassId,a.atomName,
                a.atomStatic,a.atomStaticKey,a.atomRevision,a.atomLanguage,a.atomCategoryId,j.categoryName as atomCategoryName,a.atomTags,a.atomSimple,a.atomDisabled,
                a.allowComment,a.starCount,a.commentCount,a.attachmentCount,a.readCount,a.userIdCreated,a.userIdUpdated,a.createdAt as atomCreatedAt,a.updatedAt as atomUpdatedAt,
                b.module,b.atomClassName,b.atomClassIdParent,
                ${_userField}
                g2.userName as userNameUpdated,g2.avatar as avatarUpdated
                ${_starField}
                ${_labelField}
                ${_resourceField}
                ${_flowField}
                ${_cmsField}
          from aAtom a

            inner join aAtomClass b on a.atomClassId=b.id
            ${_userJoin}
            left join aUser g2 on a.userIdUpdated=g2.id
            left join aCategory j on a.atomCategoryId=j.id
            ${_itemJoin}
            ${_resourceJoin}
            ${_flowJoin}
            ${_cmsJoin}

          where a.id=${atomId}
            and a.deleted=0 and a.iid=${iid}
            ${_resourceWhere}
            ${_flowWhere}
            ${_cmsWhere}
        `;

      // ok
      return _sql;
    }
  }
  return Procedure;
};
