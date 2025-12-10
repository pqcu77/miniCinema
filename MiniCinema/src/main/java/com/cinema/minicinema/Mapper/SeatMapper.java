package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Seat;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface SeatMapper {

    /**
     * 根据影厅ID查询所有座位
     */
    @Select("SELECT * FROM seats WHERE hall_id = #{hallId} ORDER BY row_num, col_num")
    List<Seat> selectByHallId(Integer hallId);

    /**
     * 根据座位ID查询座位
     */
    @Select("SELECT * FROM seats WHERE seat_id = #{seatId}")
    Seat selectById(Integer seatId);

    /**
     * 批量查询座位
     */
    @Select("<script>" +
            "SELECT * FROM seats WHERE seat_id IN " +
            "<foreach collection='seatIds' item='id' open='(' separator=',' close=')'>" +
            "#{id}" +
            "</foreach>" +
            "</script>")
    List<Seat> selectByIds(@Param("seatIds") List<Integer> seatIds);

    /**
     * 查询影厅的行列数
     */
    @Select("SELECT MAX(row_num) as max_row, MAX(col_num) as max_col " +
            "FROM seats WHERE hall_id = #{hallId}")
    @Results({
            @Result(column = "max_row", property = "maxRow"),
            @Result(column = "max_col", property = "maxCol")
    })
    SeatLayoutInfo getLayoutInfo(Integer hallId);

    /**
     * 座位布局信息（简单 POJO 类）
     */
    class SeatLayoutInfo {
        private Integer maxRow;
        private Integer maxCol;

        public Integer getMaxRow() {
            return maxRow;
        }

        public void setMaxRow(Integer maxRow) {
            this.maxRow = maxRow;
        }

        public Integer getMaxCol() {
            return maxCol;
        }

        public void setMaxCol(Integer maxCol) {
            this.maxCol = maxCol;
        }
    }
}