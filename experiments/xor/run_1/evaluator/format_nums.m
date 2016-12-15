function [x] = format_nums(n)
  x = "";
  for i = n
    s = sprintf("%.3f", i);
    while size(s) < 6
      s = [" " s];
    end
    x = [x s " | "];
  end
  % Remove trailing whitespace.
  x = strcat(x);
end
