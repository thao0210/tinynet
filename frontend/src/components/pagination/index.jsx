import React from 'react';
import ReactPaginate from 'react-paginate';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // css của tippy
import classes from './styles.module.scss';   // css tự viết

const Pagination = ({ currentPage, pageCount, onPageChange, total = 0 }) => {
  return (
    <div className={classes.paginationWrapper}>
      <strong>Total: {total}</strong>
      <ReactPaginate
        forcePage={currentPage - 1} // react-paginate dùng index 0-base
        pageCount={pageCount}
        onPageChange={(selectedItem) => onPageChange(selectedItem.selected + 1)}
        marginPagesDisplayed={1}
        pageRangeDisplayed={2}
        containerClassName={classes.pagination}
        pageClassName={classes.pageItem}
        pageLinkClassName={classes.pageLink}
        previousLabel={
          <Tippy content="Previous Page">
            <span>←</span>
          </Tippy>
        }
        nextLabel={
          <Tippy content="Next Page">
            <span>→</span>
          </Tippy>
        }
        previousClassName={classes.pageItem}
        nextClassName={classes.pageItem}
        breakLabel="..."
        breakClassName={classes.pageItem}
        breakLinkClassName={classes.pageLink}
        activeClassName={classes.active}
        disabledClassName={classes.disabled}
      />
    </div>
  );
};

export default Pagination;
