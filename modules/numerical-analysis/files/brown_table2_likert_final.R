# ============================================================
# Brown (1994), Table II: audit the counts, then draw Figure 1
# File name: brown_table2_likert_revised.R
#
# WHY THIS VERSION IS DIFFERENT
# This script begins with Brown's printed COUNTS, not only the
# finished percentages. That matters because the Row 8 problem
# should be discovered by the checks, not hidden before plotting.
# ============================================================

# ------------------------------------------------------------
# STEP 1: Install and load the packages
# ------------------------------------------------------------
# ggplot2 draws the chart.
# ggpattern adds diagonal stripes to the reconstructed segment.

packages_needed <- c("ggplot2", "ggpattern")
packages_missing <- packages_needed[
  !vapply(packages_needed, requireNamespace, logical(1), quietly = TRUE)
]

if (length(packages_missing) > 0) {
  install.packages(
    packages_missing,
    repos = "https://cloud.r-project.org"
  )
}

library(ggplot2)
library(ggpattern)

# CHECKPOINT:
# Continue if no red Error message appears.

# ------------------------------------------------------------
# STEP 2: Enter Brown's printed counts and percentages
# ------------------------------------------------------------
# Agree_n, Neutral_n and Disagree_n are the printed counts.
# Agree_printed, Neutral_printed and Disagree_printed are the
# percentages printed beside those counts in Table II.
#
# Theme is my reading of the questionnaire, not Brown's layout.
# Figure_order controls the final top-to-bottom order.

brown <- data.frame(
  Brown_row = 1:24,
  Theme = c(
    "Personal position", "Personal position",
    rep("Barriers to provision", 7),
    rep("Policy and service design", 15)
  ),
  Statement = c(
    "Would like to offer more intrapartum care",
    "Feel sufficiently competent in obstetrics",
    "My lack of confidence",
    "Lack of hospital GP obstetric facilities",
    "Fear of litigation",
    "Rate of remuneration",
    "Disruption of personal life",
    "Attitudes of fellow partners",
    "Current workload",
    "Midwife as lead professional",
    "Obstetricians for complicated pregnancies",
    "Vocational training radically altered",
    "Women should choose place of birth",
    "Hospital birth policy unjustified on safety",
    "Widespread demand for greater choice",
    "Risk of demarcation dispute",
    "Midwives should examine newborns",
    "Item of service payments redesigned",
    "Pay weighted to intrapartum providers",
    "Wrong to delist over home confinement",
    "Duty to arrange home confinement",
    "Care community based near home",
    "Willing GPs should be enabled",
    "SHO training on the normal"
  ),
  Agree_n = c(
    124, 153, 267, 182, 377, 210, 407, 203, 453, 248, 423, 197,
    286, 189, 315, 377, 221, 182, 150, 384, 92, 385, 501, 418
  ),
  Neutral_n = c(
    61, 42, 62, 115, 61, 157, 46, 109, 34, 62, 33, 197,
    86, 48, 80, 109, 68, 185, 100, 67, 46, 58, 34, 62
  ),
  Disagree_n = c(
    358, 349, 217, 247, 107, 178, 93, 178, 59, 234, 89, 150,
    173, 307, 152, 60, 256, 177, 297, 92, 398, 97, 12, 67
  ),
  Agree_printed = c(
    23, 28, 49, 33, 69, 39, 75, 37, 83, 46, 78, 36,
    52, 35, 58, 69, 41, 33, 27, 71, 17, 71, 92, 76
  ),
  Neutral_printed = c(
    11, 8, 11, 21, 11, 29, 8, 20, 6, 11, 6, 36,
    16, 9, 15, 20, 12, 34, 18, 12, 9, 11, 6, 11
  ),
  Disagree_printed = c(
    66, 64, 40, 45, 20, 33, 17, 33, 11, 43, 16, 28,
    32, 56, 28, 11, 47, 33, 54, 17, 74, 18, 2, 12
  )
)

# CHECKPOINT:
# Brown's Row 8 should be "Attitudes of fellow partners".
stopifnot(brown$Statement[brown$Brown_row == 8] ==
            "Attitudes of fellow partners")
stopifnot(nrow(brown) == 24)

# ------------------------------------------------------------
# STEP 3: Let the printed counts reveal the problem
# ------------------------------------------------------------
# Add the three printed counts to recover each item denominator.
# For 23 rows, the total should fall between 536 and 547.
# Row 8 should stand out with a total of only 490.

brown$n_item_printed <-
  brown$Agree_n + brown$Neutral_n + brown$Disagree_n

# Add the three printed percentages.
brown$percent_sum_printed <-
  brown$Agree_printed + brown$Neutral_printed + brown$Disagree_printed

# Display the audit table in the Console.
audit <- brown[, c(
  "Brown_row", "Statement", "n_item_printed", "percent_sum_printed"
)]
print(audit)

# Find rows whose printed percentages do not total 99, 100 or 101.
# A one-point difference is allowed because Brown rounded percentages.
problem_rows <- subset(
  audit,
  percent_sum_printed < 99 | percent_sum_printed > 101
)
print(problem_rows)

# These checks prove that Row 8 is the one printed row that fails.
stopifnot(nrow(problem_rows) == 1)
stopifnot(problem_rows$Brown_row == 8)
stopifnot(problem_rows$n_item_printed == 490)
stopifnot(problem_rows$percent_sum_printed == 90)

# Check the recoverable item denominators without Row 8.
recoverable_rows <- subset(brown, Brown_row != 8)
stopifnot(min(recoverable_rows$n_item_printed) == 536)
stopifnot(max(recoverable_rows$n_item_printed) == 547)

# ------------------------------------------------------------
# STEP 4: Reconstruct Row 8 and connect the check to the data
# ------------------------------------------------------------
# Route A (REJECTED): I first used subgroup figures (203 agree,
# 177 disagree) from an AI summary of Brown. I could not find
# them in the paper, so Route A is kept only as a record.
row8_neutral_route_a <- 544 - 203 - 177

# Route B (ADOPTED): uses only Table II's printed agree and
# disagree counts and a denominator of 545, which sits inside
# the observed range of 536 to 547.
row8_neutral_route_b <- 545 - 203 - 178

print(row8_neutral_route_a)
print(row8_neutral_route_b)

# Both routes give 164, but only Route B rests on printed data.
stopifnot(row8_neutral_route_a == 164)
stopifnot(row8_neutral_route_b == 164)

# Convert the adopted count to a rounded percentage.
row8_neutral_pct <- round(100 * row8_neutral_route_b / 545)
stopifnot(row8_neutral_pct == 30)

# Create corrected count columns. They begin as copies of the printed
# counts. Only Row 8's neutral count changes, from 109 to 164.
# Route B keeps Brown's printed agree and disagree cells unchanged.
brown$Agree_n_clean <- brown$Agree_n
brown$Neutral_n_clean <- brown$Neutral_n
brown$Disagree_n_clean <- brown$Disagree_n
brown$Neutral_n_clean[brown$Brown_row == 8] <- row8_neutral_route_b

# This linked check tests the value inside the corrected data frame.
stopifnot(
  brown$Neutral_n_clean[brown$Brown_row == 8] == row8_neutral_route_b
)

# Calculate every cleaned item denominator once, after the correction.
brown$n_item_clean <-
  brown$Agree_n_clean + brown$Neutral_n_clean + brown$Disagree_n_clean

# Calculate percentages from the cleaned counts.
brown$Agree <- 100 * brown$Agree_n_clean / brown$n_item_clean
brown$Neutral <- 100 * brown$Neutral_n_clean / brown$n_item_clean
brown$Disagree <- 100 * brown$Disagree_n_clean / brown$n_item_clean
brown$Reconstructed <- brown$Brown_row == 8

# Final numerical checks.
stopifnot(brown$n_item_clean[brown$Brown_row == 8] == 545)
stopifnot(round(brown$Neutral[brown$Brown_row == 8]) == 30)
stopifnot(brown$Agree_n_clean[brown$Brown_row == 8] == 203)
stopifnot(brown$Disagree_n_clean[brown$Brown_row == 8] == 178)
stopifnot(all(abs(brown$Agree + brown$Neutral + brown$Disagree - 100) < 0.001))

# ------------------------------------------------------------
# STEP 5: Order statements inside the three themes
# ------------------------------------------------------------
# Higher agreement should appear first inside each theme.
# Theme_order fixes the order of the three blocks.

brown$Theme_order <- match(
  brown$Theme,
  c("Personal position", "Barriers to provision", "Policy and service design")
)

brown <- brown[order(brown$Theme_order, -brown$Agree), ]

# facet_grid() sorts character labels alphabetically. Converting Theme
# to a factor makes the intended block order reach the finished plot.
brown$Theme <- factor(
  brown$Theme,
  levels = c(
    "Personal position",
    "Barriers to provision",
    "Policy and service design"
  )
)

brown$Figure_order <- seq_len(nrow(brown))
brown$y <- -brown$Figure_order

# Check that agreement never increases inside a theme. Ties are allowed.
for (one_theme in unique(brown$Theme)) {
  agreement_values <- brown$Agree[brown$Theme == one_theme]
  stopifnot(all(diff(agreement_values) <= 0))
}

# ------------------------------------------------------------
# STEP 6: Build segment positions for a real legend
# ------------------------------------------------------------
# A diverging chart puts disagreement left of zero, agreement right of
# zero, and half of the neutral section on each side of zero.

brown$neutral_half <- brown$Neutral / 2
brown$ymin <- brown$y - 0.36
brown$ymax <- brown$y + 0.36

segments <- rbind(
  data.frame(
    Brown_row = brown$Brown_row,
    Statement = brown$Statement,
    Theme = brown$Theme,
    y = brown$y,
    ymin = brown$ymin,
    ymax = brown$ymax,
    Response = "Disagree",
    Value = brown$Disagree,
    xmin = -(brown$Disagree + brown$neutral_half),
    xmax = -brown$neutral_half
  ),
  data.frame(
    Brown_row = brown$Brown_row,
    Statement = brown$Statement,
    Theme = brown$Theme,
    y = brown$y,
    ymin = brown$ymin,
    ymax = brown$ymax,
    Response = "No opinion",
    Value = brown$Neutral,
    xmin = -brown$neutral_half,
    xmax = brown$neutral_half
  ),
  data.frame(
    Brown_row = brown$Brown_row,
    Statement = brown$Statement,
    Theme = brown$Theme,
    y = brown$y,
    ymin = brown$ymin,
    ymax = brown$ymax,
    Response = "Agree",
    Value = brown$Agree,
    xmin = brown$neutral_half,
    xmax = brown$Agree + brown$neutral_half
  )
)

segments$Response <- factor(
  segments$Response,
  levels = c("Disagree", "No opinion", "Agree")
)

# Check that every complete rectangle fits inside the coordinate window.
# This protects the two longest agree bars from being dropped accidentally.
stopifnot(max(segments$xmax) < 100, min(segments$xmin) > -85)

# Print the two outer limits so the Console shows the available margin.
print(max(segments$xmax))
print(min(segments$xmin))

# Data used only to draw stripes over the reconstructed neutral segment.
row8_pattern <- subset(
  segments,
  Brown_row == 8 & Response == "No opinion"
)

# Data labels are shown only when a segment is at least 5 percentage
# points wide. This prevents the 2% label from spilling outside its bar.
label_data <- subset(
  segments,
  Response != "No opinion" & Value >= 5
)
label_data$label_x <- (label_data$xmin + label_data$xmax) / 2
label_data$label <- round(label_data$Value)

# ------------------------------------------------------------
# STEP 7: Draw the forum version of Figure 1
# ------------------------------------------------------------

figure_forum <- ggplot() +
  geom_rect(
    data = segments,
    aes(
      xmin = xmin, xmax = xmax,
      ymin = ymin, ymax = ymax,
      fill = Response
    ),
    colour = NA
  ) +
  geom_rect_pattern(
    data = row8_pattern,
    aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    inherit.aes = FALSE,
    fill = "#BDBDBD",
    colour = "black",
    linewidth = 0.45,
    pattern = "stripe",
    pattern_colour = "black",
    pattern_fill = "#BDBDBD",
    pattern_angle = 45,
    pattern_density = 0.35,
    pattern_spacing = 0.035
  ) +
  geom_text(
    data = label_data,
    aes(x = label_x, y = y, label = label),
    colour = "white",
    size = 3.5
  ) +
  geom_vline(xintercept = 0, colour = "black", linewidth = 0.45) +
  geom_segment(
    data = row8_pattern,
    aes(x = xmax, y = y, xend = 55, yend = y - 0.45),
    inherit.aes = FALSE,
    linewidth = 0.45
  ) +
  geom_text(
    data = row8_pattern,
    aes(
      x = 56, y = y - 0.47,
      label = "neutral cell reconstructed:\n164, not the printed 109"
    ),
    inherit.aes = FALSE,
    hjust = 0,
    vjust = 0.5,
    size = 3.1
  ) +
  facet_grid(
    rows = vars(Theme),
    scales = "free_y",
    space = "free_y",
    switch = "y"
  ) +
  scale_fill_manual(
    values = c(
      "Disagree" = "#C4514D",
      "No opinion" = "#BDBDBD",
      "Agree" = "#5586BE"
    ),
    breaks = c("Disagree", "No opinion", "Agree"),
    name = NULL
  ) +
  scale_y_continuous(
    breaks = function(lims) brown$y[brown$y >= lims[1] + 0.5 & brown$y <= lims[2] - 0.5],
    labels = function(b) brown$Statement[match(b, brown$y)],
    expand = expansion(add = 0.7)
  ) +
  scale_x_continuous(
    breaks = seq(-80, 80, 20),
    labels = abs(seq(-80, 80, 20)),
    expand = expansion(mult = c(0.01, 0.01))
  ) +
  # Put the visible range in the coordinate system. Unlike scale limits,
  # coord_cartesian() zooms without changing out-of-range values to NA.
  coord_cartesian(xlim = c(-85, 100), clip = "off") +
  labs(
    x = "Percentage of respondents (neutral responses straddle zero)",
    y = NULL,
    caption = "Data from Brown (1994) Table II. Row 8 counts sum to 490; neutral cell reconstructed as 164 using a denominator of 545."
  ) +
  guides(
    fill = guide_legend(
      override.aes = list(colour = NA),
      nrow = 1,
      byrow = TRUE
    )
  ) +
  theme_minimal(base_size = 13) +
  theme(plot.title.position = "plot",
        plot.title = element_text(hjust = 0, face = "bold"),
    legend.position = "bottom",
    legend.text = element_text(size = 11),
    strip.placement = "outside",
    strip.text.y.left = element_text(
      angle = 0,
      face = "bold",
      size = 13,
      hjust = 0
    ),
    strip.background = element_blank(),
    panel.grid.major.y = element_blank(),
    panel.grid.minor = element_blank(),
    panel.grid.major.x = element_blank(),
    axis.text.y = element_text(size = 10.5, colour = "black"),
    axis.text.x = element_text(size = 10, colour = "black"),
    axis.title.x = element_text(size = 11),
    panel.spacing.y = unit(0.7, "lines"),
    plot.margin = margin(15, 75, 10, 15)
  )

# Show the forum version, which relies on the caption above or below it.
print(figure_forum)

# Add a title only to the repository copy, where the image may be opened
# without the discussion-post caption.
figure_repository <- figure_forum +
  labs(
    title = "Nottinghamshire GPs' responses to 24 statements about childbirth care"
  ) +
  theme(
    plot.title = element_text(face = "bold", size = 15, hjust = 0)
  )

# ------------------------------------------------------------
# STEP 8: Save forum and repository PNG files
# ------------------------------------------------------------
# This produces a 2400 x 2200 pixel image, large enough to read but
# smaller than the earlier 4800 x 4500 version.

# Version for the discussion forum: no title because the post supplies
# a numbered caption immediately beside the image.
ggsave(
  filename = "fig1_likert_forum.png",
  plot = figure_forum,
  width = 12,
  height = 11,
  units = "in",
  dpi = 200,
  bg = "white"
)

# Version for the e-portfolio or code repository: includes its own title.
ggsave(
  filename = "fig1_likert_repository.png",
  plot = figure_repository,
  width = 12,
  height = 11.5,
  units = "in",
  dpi = 200,
  bg = "white"
)

# FINAL CHECKPOINT:
# In RStudio's Files pane, open both saved PNG files and confirm:
# 1. all 24 statements appear in three blocks;
# 2. agreement decreases within each block;
# 3. Row 8 has a striped neutral segment;
# 4. the legend uses colour swatches plus text labels;
# 5. the 2% disagree segment has no overflowing number label;
# 6. the forum copy has no title and the repository copy has a title;
# 7. the Current workload and Willing GPs bars both appear fully.
